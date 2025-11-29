import { NextResponse } from "next/server";

const API_BASE_URL = "https://api.swiftree.app";
const INTERNAL_SECRET = process.env.INTERNAL_SECRET;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    console.log("Token validation request received");

    // Basic validation
    if (!token) {
      return NextResponse.json(
        { 
          status: "error", 
          message: "Token is required", 
          success: false 
        },
        { status: 400 }
      );
    }

    // Validate token format (basic check)
    if (typeof token !== "string" || token.length < 10) {
      return NextResponse.json(
        { 
          status: "error", 
          message: "Invalid token format", 
          success: false 
        },
        { status: 400 }
      );
    }

    // Check if internal secret is configured
    if (!INTERNAL_SECRET) {
      console.error("INTERNAL_SECRET is not configured");
      return NextResponse.json(
        { 
          status: "error", 
          message: "Service configuration error", 
          success: false 
        },
        { status: 500 }
      );
    }

    // Prepare request to external API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/validate-reset-token?token=${encodeURIComponent(token)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Internal-Secret": INTERNAL_SECRET,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      console.log("External API response status:", response.status);

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        responseData = { message: "Unknown error occurred" };
      }

      // Handle successful response
      if (response.status === 200) {
        return NextResponse.json(
          {
            status: "success",
            message: responseData.message || "Token validated successfully",
            success: true,
            data: responseData.data || { valid: true }
          },
          { status: 200 }
        );
      }

      // Handle specific error cases
      if (response.status === 400) {
        return NextResponse.json(
          { 
            status: "error", 
            message: responseData.message || "Invalid token", 
            success: false 
          },
          { status: 400 }
        );
      }

      if (response.status === 401) {
        console.error("Authentication failed - check INTERNAL_SECRET");
        return NextResponse.json(
          { 
            status: "error", 
            message: "Authentication service error", 
            success: false 
          },
          { status: 500 }
        );
      }

      if (response.status === 404) {
        return NextResponse.json(
          { 
            status: "error", 
            message: responseData.message || "Token not found", 
            success: false 
          },
          { status: 404 }
        );
      }

      // Handle other status codes
      return NextResponse.json(
        { 
          status: "error", 
          message: responseData.message || "Failed to validate token", 
          success: false 
        },
        { status: response.status }
      );

    } // eslint-disable-next-line @typescript-eslint/no-explicit-any 
    catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === "AbortError") {
        console.error("Request timeout:", fetchError);
        return NextResponse.json(
          { 
            status: "error", 
            message: "Authentication service is not responding. Please try again later.", 
            success: false 
          },
          { status: 408 }
        );
      }
      
      // Connection errors
      console.error("API connection error:", fetchError);
      return NextResponse.json(
        { 
          status: "error", 
          message: "Unable to connect to authentication service. Please try again later.", 
          success: false 
        },
        { status: 503 }
      );
    }

  } // eslint-disable-next-line @typescript-eslint/no-explicit-any 
  catch (error: any) {
    console.error("Unexpected error in token validation API:", error);
    return NextResponse.json(
      { 
        status: "error", 
        message: "Internal server error", 
        success: false 
      },
      { status: 500 }
    );
  }
}