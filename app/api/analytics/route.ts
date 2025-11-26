// app/api/analytics/overview/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://api.swiftree.app";
const CACHE_DURATION = 300; // 5 minutes cache for analytics
const cache = new Map();

export async function GET(request: NextRequest) {
  try {
    // Get token and store_id from cookies
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Validate required parameters
    if (!startDate) {
      return NextResponse.json(
        { status: "error", message: "startDate is required" },
        { status: 400 }
      );
    }

    // Create cache key based on all parameters
    const cacheKey = `analytics-${storeId}-${startDate}-${endDate}`;

    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION * 1000) {
      console.log('Returning cached analytics data');
      return NextResponse.json(cachedData.data);
    }

    // Build query string for the external API
    const queryParams = new URLSearchParams({
      startDate,
      ...(endDate && { endDate }),
    });

    console.log(`📊 Fetching analytics for store: ${storeId}`);
    console.log(`📊 Date range: ${startDate} to ${endDate || 'now'}`);

    const response = await fetch(
      `${API_BASE_URL}/api/analytics/store/${storeId}/overview?${queryParams}`,
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
      console.error('❌ Analytics API error:', response.status, errorText);
      
      let errorMessage = `Failed to fetch analytics: ${response.status}`;
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
    console.log('✅ Successfully fetched analytics data');

    // Cache the successful response
    if (result.status === 'success') {
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      console.log('Cached analytics data for key:', cacheKey);
    }

    return NextResponse.json(result);

  } // eslint-disable-next-line @typescript-eslint/no-explicit-any 
  catch (error: any) {
    console.error("Error fetching analytics:", error);
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
    console.log('Analytics cache cleared');
    return NextResponse.json(
      { status: "success", message: "Analytics cache cleared" },
      { status: 200 }
    );
  } // eslint-disable-next-line @typescript-eslint/no-explicit-any 
  catch (error: any) {
    console.error("Error clearing analytics cache:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}