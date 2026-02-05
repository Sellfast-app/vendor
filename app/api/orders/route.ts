// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://api.swiftree.app";

const CACHE_DURATION = 300; // 5 minutes
const cache = new Map();

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const cookieHeader = request.headers.get("cookie");
    let token = null;

    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies.accessToken || null;
    }

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Authentication required" },
        { status: 401 }
      );
    }

    // Get store_id from cookies
    let storeId = null;
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      storeId = cookies.store_id || null;
    }

    if (!storeId) {
      return NextResponse.json(
        { status: "error", message: "Store ID not found" },
        { status: 400 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "10";
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const deliveryMethod = searchParams.get("deliveryMethod");

    // Create cache key
    const cacheKey = `orders-${storeId}-${page}-${pageSize}-${status}-${paymentStatus}-${search}-${startDate}-${endDate}-${deliveryMethod}`;

    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION * 1000) {
      console.log('✅ Returning cached orders data');
      return NextResponse.json(cachedData.data);
    }

    // Build query string - only add non-empty params
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('pageSize', pageSize);
    
    if (status && status !== 'all') {
      queryParams.append('order_status', status); 
    }
    if (paymentStatus && paymentStatus !== 'all') {
      queryParams.append('payment_status', paymentStatus); 
    }
    if (search) {
      queryParams.append('search', search);
    }
    if (startDate) {
      queryParams.append('start_date', startDate); 
    }
    if (endDate) {
      queryParams.append('end_date', endDate); 
    }
    if (deliveryMethod && deliveryMethod !== 'all') {
      queryParams.append('delivery_method', deliveryMethod); 
    }

    console.log(`🔍 Fetching orders for store: ${storeId}`);
    console.log(`🔍 Query params: ${queryParams.toString()}`);

    const response = await fetch(
      `${API_BASE_URL}/api/orders/store/${storeId}?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Orders API error:', response.status, errorText);
      
      let errorMessage = `Failed to fetch orders: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      return NextResponse.json(
        { status: "error", message: errorMessage },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log(`✅ Successfully fetched ${result.data?.items?.length || 0} orders out of ${result.data?.total || 0} total`);

    // Cache successful response
    if (result.status === 'success') {
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      console.log('📦 Cached orders data');
    }

    return NextResponse.json(result);

  }// eslint-disable-next-line @typescript-eslint/no-explicit-any 
  catch (error: any) {
    console.error("❌ Error fetching orders:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Clear cache when needed
export async function DELETE() {
  try {
    cache.clear();
    console.log('Orders cache cleared');
    return NextResponse.json(
      { status: "success", message: "Cache cleared" },
      { status: 200 }
    );
  } // eslint-disable-next-line @typescript-eslint/no-explicit-any
   catch (error: any) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}