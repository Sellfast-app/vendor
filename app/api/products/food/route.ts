// app/api/products/food/route.ts
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: Request) {
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
    
    // Get form data from request
    const formData = await request.formData();
    
    // Add store_id if not present (don't use .set() as it might corrupt FormData)
    if (!formData.has('store_id')) {
      formData.append('store_id', storeId);
    }
    
    // Log for debugging
    console.log("🍔 Food API - FormData entries:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File - name: ${value.name}, size: ${value.size}, type: ${value.type}`);
      } else {
        const strValue = typeof value === 'string' ? value : String(value);
        console.log(`  ${key}: ${strValue.substring(0, 100)}`);
      }
    }
    
    // Prepare request to external API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/food`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Check content type before parsing as JSON
      const contentType = response.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        console.error("❌ Non-JSON response received:", textResponse.substring(0, 500));
        
        return NextResponse.json(
          { 
            status: "error", 
            message: `Server returned unexpected response: ${response.status} ${response.statusText}` 
          },
          { status: 502 }
        );
      }
      
      // Parse as JSON
      const result = await response.json();
      
      console.log("🍔 Food API Response:", JSON.stringify(result, null, 2));
      
      if (!response.ok) {
        return NextResponse.json(
          { status: "error", message: result.message || "Failed to add food item" },
          { status: response.status }
        );
      }

      return NextResponse.json(result, { status: response.status });
      
    }
   // eslint-disable-next-line @typescript-eslint/no-explicit-any 
    catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === "AbortError") {
        return NextResponse.json(
          { status: "error", message: "Request timeout. Please try again." },
          { status: 408 }
        );
      }
      
      console.error("❌ API connection error:", fetchError);
      return NextResponse.json(
        { status: "error", message: "Unable to connect to food service. Please try again later." },
        { status: 503 }
      );
    }
    
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
   catch (error: any) {
    console.error("❌ Unexpected error in food API route:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}