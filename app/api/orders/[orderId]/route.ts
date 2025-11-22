// app/api/orders/[orderId]/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://api.swiftree.app";

const CACHE_DURATION = 300; // 5 minutes
const cache = new Map();

// Helper function to get all products with pagination
async function getAllProducts(token: string, storeId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allProducts: any[] = [];
  let page = 1;
  const pageSize = 100; // Get maximum per page
  
  try {
    while (true) {
      const response = await fetch(
        `${API_BASE_URL}/api/products/store/${storeId}?page=${page}&pageSize=${pageSize}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error(`Failed to fetch products page ${page}`);
        break;
      }

      const result = await response.json();
      
      if (result.status === 'success' && result.data && result.data.items) {
        allProducts = [...allProducts, ...result.data.items];
        
        // Check if we've fetched all pages
        if (result.data.items.length < pageSize) {
          break;
        }
        page++;
      } else {
        break;
      }
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }
  
  return allProducts;
}

export async function GET(
  request: NextRequest, 
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const params = await context.params;
    const { orderId } = params;

    // Get token from cookies
    const cookieHeader = request.headers.get("cookie");
    let token = null;
    let storeId = null;

    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies.accessToken || null;
      storeId = cookies.store_id || null;
    }

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Authentication required" },
        { status: 401 }
      );
    }

    if (!storeId) {
      return NextResponse.json(
        { status: "error", message: "Store ID not found" },
        { status: 400 }
      );
    }

    if (!orderId) {
      return NextResponse.json(
        { status: "error", message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Create cache key
    const cacheKey = `order-${orderId}`;

    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION * 1000) {
      console.log('Returning cached order details');
      return NextResponse.json(cachedData.data);
    }

    console.log(`🔍 Fetching order details for: ${orderId}`);

    // Fetch order details
    const orderResponse = await fetch(
      `${API_BASE_URL}/api/orders/${orderId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('❌ Order details API error:', orderResponse.status, errorText);
      
      let errorMessage = `Failed to fetch order details: ${orderResponse.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      return NextResponse.json(
        { status: "error", message: errorMessage },
        { status: orderResponse.status }
      );
    }

    const orderResult = await orderResponse.json();
    console.log('✅ Successfully fetched order details');

    // If order fetch was successful, enrich order items with product data
    if (orderResult.status === 'success' && orderResult.data && orderResult.data.order) {
      console.log('🔄 Enriching order items with product data...');
      
      // Fetch all products for this store
      const allProducts = await getAllProducts(token, storeId);
      console.log(`📦 Fetched ${allProducts.length} products for enrichment`);
      
      // Create a map for quick product lookups
      const productMap = new Map();
      allProducts.forEach(product => {
        productMap.set(product.id, product);
      });
      
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enrichedOrderItems = orderResult.data.order.order_items.map((item: any) => {
        const product = productMap.get(item.product_id);
        
        if (product) {
          return {
            ...item,
            product_name: product.product_name,
            product_image: product.product_images?.[0] || null, // Use first image
            product_images: product.product_images || [] // All images
          };
        }
        
        // If product not found, use existing data
        return {
          ...item,
          product_name: item.name, // Use the name from order item as fallback
          product_image: null,
          product_images: []
        };
      });
      
      // Update the order with enriched items
      orderResult.data.order.order_items = enrichedOrderItems;
      
      console.log('✅ Order items enriched with product data');
    }

    // Cache the successful response
    if (orderResult.status === 'success') {
      cache.set(cacheKey, {
        data: orderResult,
        timestamp: Date.now()
      });
      console.log('Cached enriched order details for key:', cacheKey);
    }

    return NextResponse.json(orderResult);

  }  // eslint-disable-next-line @typescript-eslint/no-explicit-any 
  catch (error: any) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}