import { NextResponse } from "next/server";

const API_BASE_URL = "https://api.swiftree.app";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    console.log("Request reset password for email:", email);

    // Basic validation
    if (!email) {
      return NextResponse.json(
        { status: "error", message: "Email is required", success: false },
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

    // Prepare request to external API - using your exact endpoint format
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/request-reset-password-link/${encodeURIComponent(email)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      console.log("External API response status:", response.status);

      // Handle successful response (200 status)
      if (response.status === 200) {
        return NextResponse.json(
          {
            status: "success",
            message: "Password reset link sent successfully. Please check your email.",
            success: true,
          },
          { status: 200 }
        );
      }

      // Handle other status codes
      return NextResponse.json(
        { 
          status: "error", 
          message: "Failed to send reset link. Please check if this email is registered.", 
          success: false 
        },
        { status: response.status }
      );

    }  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  }  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (error: any) {
    console.error("Unexpected error in reset password request API:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}