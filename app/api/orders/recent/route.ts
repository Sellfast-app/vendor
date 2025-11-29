import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://api.swiftree.app";

export async function GET(request: NextRequest) {
  try {
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
      console.error('❌ No access token found');
      return NextResponse.json(
        { status: "error", message: "Authentication required" },
        { status: 401 }
      );
    }

    if (!storeId) {
      console.error('❌ No store ID found');
      return NextResponse.json(
        { status: "error", message: "Store ID not found" },
        { status: 400 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "6";
    const payment_status = searchParams.get("payment_status") || "";
    const search = searchParams.get("search") || "";

    // Build query string
    const queryParams = new URLSearchParams({
      page,
      pageSize,
      ...(payment_status && { payment_status }),
      ...(search && { search }),
    });

    const externalUrl = `${API_BASE_URL}/api/stores/${storeId}/dashboard/recent-orders?${queryParams}`;
    console.log('🔍 Fetching recent orders from:', externalUrl);

    const response = await fetch(externalUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ External API error:', response.status, errorText);
      
      if (response.status === 401) {
        return NextResponse.json(
          { 
            status: "error", 
            message: "Authentication failed. Please login again.",
            data: { items: [], total: 0, totalPages: 0 }
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { 
          status: "error", 
          message: "Failed to fetch recent orders",
          data: { items: [], total: 0, totalPages: 0 }
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('✅ Recent orders fetched successfully:', {
      itemsCount: result.data?.items?.length || 0,
      total: result.data?.total || 0
    });
    
    return NextResponse.json(result);

  } catch (error) {
    console.error("❌ Recent orders API error:", error);
    return NextResponse.json(
      { 
        status: "error", 
        message: "Failed to fetch recent orders",
        data: { items: [], total: 0, totalPages: 0 }
      },
      { status: 500 }
    );
  }
}