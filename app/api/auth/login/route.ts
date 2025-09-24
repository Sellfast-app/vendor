// app/api/auth/login/route.ts
import { NextResponse } from "next/server";

const API_BASE_URL = "https://api.swiftree.app";

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const { email, password }: LoginRequest = await request.json();

    console.log("Login attempt for email:", email);

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { status: "error", message: "Email and password are required", success: false },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { status: "error", message: "Please enter a valid email address", success: false },
        { status: 400 }
      );
    }

    // Prepare request to external API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("External API response status:", response.status);

      const result = await response.json();
      console.log("External API response data:", result);

      // Handle the specific API response format
      if (response.status === 500 && result.status === 'fail') {
        // The API returns 500 for authentication failures
        return NextResponse.json(
          { 
            status: "error", 
            message: result.message || "Invalid email or password. Please check your credentials.", 
            success: false 
          },
          { status: 401 } // Return 401 (Unauthorized) to frontend
        );
      }

      if (!response.ok) {
        // Handle other error statuses
        const errorMessage = result.message || "Login failed. Please try again.";
        return NextResponse.json(
          { status: "error", message: errorMessage, success: false },
          { status: response.status }
        );
      }

      // Successful login - check if response has expected structure
      if (!result.data?.token) {
        console.error("Missing token in successful response:", result);
        return NextResponse.json(
          { status: "error", message: "Invalid response from authentication service", success: false },
          { status: 502 }
        );
      }

      // Extract store name from the first store in the stores array
      let storeName = email.split('@')[0] + "'s Store"; // Default fallback
      
      if (result.data.stores && result.data.stores.length > 0) {
        const firstStore = result.data.stores[0];
        storeName = firstStore.name || firstStore.store_name || firstStore.business_name || storeName;
      }

      // Create response with token in cookie
      const nextResponse = NextResponse.json(
        {
          status: "success",
          message: result.message || "Login successful",
          success: true,
          data: {
            store_name: storeName
          }
        },
        { status: 200 }
      );

      // Set the access token as an HTTP-only cookie
      nextResponse.cookies.set("accessToken", result.data.token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 86400,
        secure: true,
      });

      // Set the store name as a cookie (not HTTP-only so it can be read by client-side JS)
      nextResponse.cookies.set("store_name", storeName, {
        path: "/",
        httpOnly: false, // Allow client-side access
        sameSite: "lax",
        maxAge: 86400,
        secure: true,
      });

      console.log("Login successful, token and store name set in cookies");
      return nextResponse;

    }       // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === "AbortError") {
        console.error("Request timeout:", fetchError);
        return NextResponse.json(
          { status: "error", message: "Authentication service is not responding. Please try again later.", success: false },
          { status: 408 }
        );
      }
      
      // Connection errors
      console.error("API connection error:", fetchError);
      return NextResponse.json(
        { status: "error", message: "Unable to connect to authentication service. Please try again later.", success: false },
        { status: 503 }
      );
    }

  }      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (error: any) {
    console.error("Unexpected error in login API:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}