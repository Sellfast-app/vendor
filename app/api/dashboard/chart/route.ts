import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies (EXACTLY like your best-selling API)
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

    // Get store_id from cookies (EXACTLY like your best-selling API)
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
    const range = searchParams.get("range") || "1Y";

    // Build external API URL
    const externalUrl = `${API_BASE_URL}/api/stores/${storeId}/dashboard/chart?range=${range}`;

    const response = await fetch(externalUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("External chart API error:", response.status, errorText);
      
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
          message: "Failed to fetch chart data",
          data: []
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    // Return the exact same structure as the external API (like your best-selling API)
    return NextResponse.json(result);

  } catch (error) {
    console.error("Chart API error:", error);
    return NextResponse.json(
      { 
        status: "error", 
        message: "Failed to fetch chart data",
        data: []
      },
      { status: 500 }
    );
  }
}