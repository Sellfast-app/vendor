import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://api.swiftree.app";

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies (EXACTLY like your products API)
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

    // Get store_id from cookies (EXACTLY like your products API)
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
    const pageSize = searchParams.get("pageSize") || "20";
    const start = searchParams.get("start") || "";
    const end = searchParams.get("end") || "";
    const filter = searchParams.get("filter") || "";

    // Build query string
    const queryParams = new URLSearchParams({
      page,
      pageSize,
      ...(start && { start }),
      ...(end && { end }),
      ...(filter && { filter }),
    });

    const externalUrl = `${API_BASE_URL}/api/stores/${storeId}/dashboard/best-selling?${queryParams}`;
    console.log("External API URL:", externalUrl);

    const response = await fetch(externalUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("External API error:", response.status, errorText);
      
      if (response.status === 401) {
        return NextResponse.json(
          { 
            status: "error", 
            message: "Authentication failed. Please login again.",
            data: []
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { 
          status: "error", 
          message: "Failed to fetch best selling products",
          data: []
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    // Return the exact same structure as the external API
    return NextResponse.json(result);

  } catch (error) {
    console.error("Best selling products API error:", error);
    return NextResponse.json(
      { 
        status: "error", 
        message: "Failed to fetch best selling products",
        data: []
      },
      { status: 500 }
    );
  }
}