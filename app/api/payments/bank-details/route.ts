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

    console.log(`🏦 Fetching bank details for store: ${storeId}`);

    const externalUrl = `${API_BASE_URL}/api/payments/store/${storeId}/bank-details`;
    console.log("External bank details URL:", externalUrl);

    const response = await fetch(externalUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("External bank details API error:", response.status, errorText);
      
      // If no bank details found (404), return empty data instead of error
      if (response.status === 404) {
        return NextResponse.json({
          status: "success",
          message: "No bank details found",
          data: null
        });
      }
      
      return NextResponse.json(
        { 
          status: "error", 
          message: "Failed to fetch bank details"
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log("✅ Bank details fetched successfully:", result);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Bank details API error:", error);
    return NextResponse.json(
      { 
        status: "error", 
        message: "Failed to fetch bank details"
      },
      { status: 500 }
    );
  }
}