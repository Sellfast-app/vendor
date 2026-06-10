// app/api/orders/[orderId]/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        console.error(`Failed to fetch products page ${page}`);
        break;
      }

      const result = await response.json();

      if (result.status === "success" && result.data && result.data.items) {
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
    console.error("Error fetching products:", error);
  }

  return allProducts;
}

async function getAllFoodProducts(token: string, storeId: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/products/food/${storeId}?page=1&pageSize=100`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("Failed to fetch food products for order enrichment");
      return [];
    }

    const result = await response.json();
    if (Array.isArray(result.data)) return result.data;
    if (Array.isArray(result.data?.items)) return result.data.items;
    return [];
  } catch (error) {
    console.error("Error fetching food products:", error);
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enrichFoodOrderItem(item: any, product: any) {
  const portions = Array.isArray(item.portion)
    ? item.portion.map((selection: { uid?: string; quantity?: number }) => {
        const portion = product.portion?.find(
          (entry: { uid?: string }) => entry.uid === selection.uid,
        );
        return {
          ...selection,
          name: portion?.name || "Portion",
          price: Number(portion?.price || 0),
          servingType: portion?.servingType,
        };
      })
    : [];

  const addOnGroups = Array.isArray(item.addOnGroup)
    ? item.addOnGroup.map(
        (groupSelection: {
          uid?: string;
          addOnGroupOption?: Array<{ uid?: string; quantity?: number }>;
        }) => {
          const group = product.addOnGroup?.find(
            (entry: { uid?: string }) => entry.uid === groupSelection.uid,
          );
          const productOptions = group?.addOnOptions || group?.options || [];

          return {
            ...groupSelection,
            name: group?.name || "Add-ons",
            addOnGroupOption: (groupSelection.addOnGroupOption || []).map(
              (optionSelection) => {
                const option = productOptions.find(
                  (entry: { uid?: string }) => entry.uid === optionSelection.uid,
                );
                return {
                  ...optionSelection,
                  name: option?.name || "Add-on",
                  price: Number(option?.price || 0),
                };
              },
            ),
          };
        },
      )
    : [];

  const bundle = item.bundleConfig?.uid
    ? product.bundleConfig?.find(
        (entry: { uid?: string }) => entry.uid === item.bundleConfig.uid,
      )
    : product.bundleConfig?.[0];

  const quantity =
    Number(item.quantity) ||
    Number(portions[0]?.quantity) ||
    Number(item.bundleConfig?.quantity) ||
    1;

  const portionTotal = portions.reduce(
    (total: number, portion: { price: number; quantity?: number }) =>
      total + portion.price * Number(portion.quantity || 1),
    0,
  );
  const servingTypePrice = Number(
    product.servingTypePricing?.find(
      (entry: { servingType?: string }) =>
        entry.servingType === item.servingType,
    )?.price || 0,
  );
  const bundleTotal = Number(bundle?.price || 0) * Number(item.bundleConfig?.quantity || quantity);
  const addOnTotal = addOnGroups.reduce(
    (
      groupTotal: number,
      group: {
        addOnGroupOption?: Array<{ price: number; quantity?: number }>;
      },
    ) =>
      groupTotal +
      (group.addOnGroupOption || []).reduce(
        (optionTotal, option) =>
          optionTotal + option.price * Number(option.quantity || 1),
        0,
      ),
    0,
  );
  const itemTotal =
    portionTotal ||
    (product.type === "Bundle"
      ? bundleTotal + addOnTotal
      : servingTypePrice * quantity + addOnTotal);

  return {
    ...item,
    quantity,
    price: quantity > 0 ? itemTotal / quantity : itemTotal,
    item_total: itemTotal,
    product_name: product.name || item.name,
    product_image: item.image || product.product_images?.[0] || null,
    product_images: product.product_images || [],
    food_type: product.type,
    portion: portions,
    addOnGroup: addOnGroups,
    ...(item.servingType && { servingType: item.servingType }),
    ...(item.bundleConfig && {
      bundleConfig: {
        ...item.bundleConfig,
        name: bundle?.name || "Bundle",
        price: Number(bundle?.price || 0),
      },
    }),
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    const params = await context.params;
    const { orderId } = params;

    // Get token from cookies
    const cookieHeader = request.headers.get("cookie");
    let token = null;
    let storeId = null;

    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce(
        (acc, cookie) => {
          const [name, value] = cookie.trim().split("=");
          acc[name] = value;
          return acc;
        },
        {} as Record<string, string>,
      );
      token = cookies.accessToken || null;
      storeId = cookies.store_id || null;
    }

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Authentication required" },
        { status: 401 },
      );
    }

    if (!storeId) {
      return NextResponse.json(
        { status: "error", message: "Store ID not found" },
        { status: 400 },
      );
    }

    if (!orderId) {
      return NextResponse.json(
        { status: "error", message: "Order ID is required" },
        { status: 400 },
      );
    }

    // Create cache key
    const cacheKey = `order-food-details-v1-${orderId}`;

    // Check cache
    const cachedData = cache.get(cacheKey);
    if (
      cachedData &&
      Date.now() - cachedData.timestamp < CACHE_DURATION * 1000
    ) {
      console.log("Returning cached order details");
      return NextResponse.json(cachedData.data);
    }

    console.log(`🔍 Fetching order details for: ${orderId}`);

    // Fetch order details
    const orderResponse = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error(
        "❌ Order details API error:",
        orderResponse.status,
        errorText,
      );

      let errorMessage = `Failed to fetch order details: ${orderResponse.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      return NextResponse.json(
        { status: "error", message: errorMessage },
        { status: orderResponse.status },
      );
    }

    const orderResult = await orderResponse.json();
    console.log("✅ Successfully fetched order details");

    // If order fetch was successful, enrich order items with product data
    if (
      orderResult.status === "success" &&
      orderResult.data &&
      orderResult.data.order
    ) {
      console.log("🔄 Enriching order items with product data...");

      // Fetch both catalogs so normal and food orders can use the same detail page.
      const [allProducts, allFoodProducts] = await Promise.all([
        getAllProducts(token, storeId),
        getAllFoodProducts(token, storeId),
      ]);
      console.log(`📦 Fetched ${allProducts.length} products for enrichment`);

      // Create a map for quick product lookups
      const productMap = new Map();
      allProducts.forEach((product) => {
        productMap.set(product.id, product);
      });
      const foodProductMap = new Map();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allFoodProducts.forEach((product: any) => {
        foodProductMap.set(product.uid || product.id, product);
      });

      const enrichedOrderItems = orderResult.data.order.order_items.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) => {
          const product = productMap.get(item.product_id);
          const foodProduct = foodProductMap.get(item.product_id);

          if (product) {
            return {
              ...item,
              product_name: product.product_name,
              product_image: product.product_images?.[0] || null, // Use first image
              product_images: product.product_images || [], // All images
            };
          }

          if (foodProduct) {
            return enrichFoodOrderItem(item, foodProduct);
          }

          // If product not found, use existing data
          return {
            ...item,
            product_name: item.name, // Use the name from order item as fallback
            product_image: item.image || null,
            product_images: item.image ? [item.image] : [],
          };
        },
      );

      // Update the order with enriched items
      orderResult.data.order.order_items = enrichedOrderItems;

      console.log("✅ Order items enriched with product data");
    }

    // Cache the successful response
    if (orderResult.status === "success") {
      cache.set(cacheKey, {
        data: orderResult,
        timestamp: Date.now(),
      });
      console.log("Cached enriched order details for key:", cacheKey);
    }

    return NextResponse.json(orderResult);
  } // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (error: any) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    const params = await context.params;
    const { orderId } = params;

    // Get token from cookies
    const cookieHeader = request.headers.get("cookie");
    let token = null;

    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce(
        (acc, cookie) => {
          const [name, value] = cookie.trim().split("=");
          acc[name] = value;
          return acc;
        },
        {} as Record<string, string>,
      );
      token = cookies.accessToken || null;
    }

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Authentication required" },
        { status: 401 },
      );
    }

    if (!orderId) {
      return NextResponse.json(
        { status: "error", message: "Order ID is required" },
        { status: 400 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { status: "error", message: "Status is required" },
        { status: 400 },
      );
    }

    // Validate status value
    const validStatuses = [
      "ready",
      "cancelled",
      "pending",
      "processing",
      "shipped",
      "fulfilled",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          status: "error",
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 },
      );
    }

    console.log(`🔄 Updating order ${orderId} status to: ${status}`);

    // Send PATCH request to backend API
    const updateResponse = await fetch(
      `${API_BASE_URL}/api/orders/${orderId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      },
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(
        "❌ Order update API error:",
        updateResponse.status,
        errorText,
      );

      let errorMessage = `Failed to update order status: ${updateResponse.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      return NextResponse.json(
        { status: "error", message: errorMessage },
        { status: updateResponse.status },
      );
    }

    const result = await updateResponse.json();
    console.log("✅ Successfully updated order status");

    // Invalidate cache for this order
    const cacheKey = `order-food-details-v1-${orderId}`;
    cache.delete(cacheKey);

    return NextResponse.json({
      status: "success",
      message: `Order status updated to ${status}`,
      data: result.data,
    });
  }// eslint-disable-next-line @typescript-eslint/no-explicit-any 
  catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 },
    );
  }
}
