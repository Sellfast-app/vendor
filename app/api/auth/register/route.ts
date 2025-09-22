// app/api/auth/register/route.ts
import { NextResponse } from "next/server";

const API_BASE_URL = "https://api.swiftree.app";

interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone_number: string;
}

interface BrandColor {
  primary: string;
  secondary: string;
  accent: string;
}

interface BusinessDetails {
  store_name: string;
  type: string;
  description: string;
  brand_color: BrandColor;
}

interface RegisterRequest {
  user_details: UserDetails;
  business_details: BusinessDetails;
}

export async function POST(request: Request) {
  try {
    const data: RegisterRequest = await request.json();

    // Validate required fields
    if (
      !data.user_details?.firstName ||
      !data.user_details?.lastName ||
      !data.user_details?.email ||
      !data.user_details?.password ||
      !data.user_details?.phone_number ||
      !data.business_details?.store_name ||
      !data.business_details?.type ||
      !data.business_details?.description ||
      !data.business_details?.brand_color?.primary
    ) {
      console.log("Validation failed: Missing required fields", data);
      return NextResponse.json(
        { status: "error", message: "Missing required fields", success: false },
        { status: 400 }
      );
    }

    console.log("Register API payload:", JSON.stringify(data, null, 2));

    // External API call with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("External API response status:", response.status);
      console.log("External API response headers:", Object.fromEntries(response.headers.entries()));

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let result;
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
        console.log("External API response:", JSON.stringify(result, null, 2));
      } else {
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        result = { message: textResponse.substring(0, 200) };
      }

      if (!response.ok) {
        console.log("Registration failed with status:", response.status);
        
        // Handle specific error cases
        if (response.status === 500 && result.status === 'fail') {
          return NextResponse.json(
            { 
              status: "error", 
              message: result.message || "Registration failed. The email might already be registered.", 
              success: false 
            },
            { status: 400 } // Return 400 instead of 500 to frontend
          );
        }
        
        return NextResponse.json(
          { 
            status: "error", 
            message: result.message || "Registration failed. Please try again.", 
            success: false 
          },
          { status: response.status }
        );
      }

      // Successful registration
      const nextResponse = NextResponse.json(
        {
          status: "success",
          message: result.message || "Registration successful",
          success: true,
          data: result.data || {
            token: "temp-token",
            store_url: "https://example.com/store",
            qrCode: "https://example.com/qr"
          }
        },
        { status: 201 }
      );

      if (result.data?.token) {
        nextResponse.cookies.set("accessToken", result.data.token, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          maxAge: 86400,
          secure: true,
        });
      }

      return nextResponse;

    }       // eslint-disable-next-line @typescript-eslint/no-explicit-any 
    catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === "AbortError") {
        console.error("Request timeout:", fetchError);
        return NextResponse.json(
          { status: "error", message: "Registration request timed out. Please try again.", success: false },
          { status: 408 }
        );
      }
      
      console.error("API connection error:", fetchError);
      return NextResponse.json(
        { status: "error", message: "Unable to connect to registration service. Please try again later.", success: false },
        { status: 503 }
      );
    }

  }       // eslint-disable-next-line @typescript-eslint/no-explicit-any
   catch (error: any) {
    console.error("Unexpected error in register API:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}