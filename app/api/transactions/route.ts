import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://api.swiftree.app";

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
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "20";
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    console.log(`💳 Fetching transactions for store: ${storeId}`);
    console.log(`📊 Page: ${page}, PageSize: ${pageSize}`);

    // Build query parameters for external API
    const queryParams = new URLSearchParams({
      page,
      limit: pageSize,
      ...(search && { search }),
      ...(status && { status }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });

    const externalUrl = `${API_BASE_URL}/api/payments/store/${storeId}/transactions?${queryParams}`;
    console.log("External transactions URL:", externalUrl);

    const response = await fetch(externalUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("External transactions API error:", response.status, errorText);
      
      return NextResponse.json(
        { 
          status: "error", 
          message: "Failed to fetch transactions"
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log("✅ Transactions fetched successfully:", result);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Transactions API error:", error);
    return NextResponse.json(
      { 
        status: "error", 
        message: "Failed to fetch transactions"
      },
      { status: 500 }
    );
  }
}