// app/api/orders/[orderId]/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://api.swiftree.app";

const CACHE_DURATION = 300; // 5 minutes
const cache = new Map();

export async function GET(
  request: NextRequest, 
  context: { params: Promise<{ orderId: string }> } // Use Promise for params in Next.js 15
) {
  try {
    const params = await context.params; // Await the params
    const { orderId } = params;

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

    const response = await fetch(
      `${API_BASE_URL}/api/orders/${orderId}`,
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
      console.error('❌ Order details API error:', response.status, errorText);
      
      let errorMessage = `Failed to fetch order details: ${response.status}`;
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
    console.log('✅ Successfully fetched order details');

    // Cache the successful response
    if (result.status === 'success') {
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      console.log('Cached order details for key:', cacheKey);
    }

    return NextResponse.json(result);

  }            // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (error: any) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}