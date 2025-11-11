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

interface BusinessMetadata {
  brand_color: BrandColor;
}

interface BusinessDetails {
  store_name: string;
  type: string;
  description?: string;  // Optional per API docs
  metadata: BusinessMetadata;  // Changed: wrapped brand_color in metadata
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
      !data.business_details?.metadata?.brand_color?.primary
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
            { status: 400 }
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
      const storeName = data.business_details.store_name;
      
      const nextResponse = NextResponse.json(
        {
          status: "success",
          message: result.message || "Registration successful",
          success: true,
          data: {
            ...result.data,
            store_name: storeName
          }
        },
        { status: 201 }
      );

      // Set cookies with same pattern as login
      const cookieOptions = {
        path: "/",
        httpOnly: true,
        sameSite: "lax" as const,
        maxAge: 86400,
        secure: process.env.NODE_ENV === "production",
      };

      if (result.data?.token) {
        nextResponse.cookies.set("accessToken", result.data.token, cookieOptions);
      }

      // Set store_name cookie (httpOnly: false so client can access)
      nextResponse.cookies.set("store_name", storeName, {
        ...cookieOptions,
        httpOnly: false,
        maxAge: 2592000, // 30 days
      });

      // Set store_id if available
      if (result.data?.store_id) {
        nextResponse.cookies.set("store_id", result.data.store_id, {
          ...cookieOptions,
          httpOnly: false,
        });
      }

      return nextResponse;

    }  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  } // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (error: any) {
    console.error("Unexpected error in register API:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}