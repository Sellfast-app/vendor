import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const INTERNAL_SECRET = process.env.INTERNAL_SECRET;

export async function POST(request: Request) {
  try {
    const { token, newPassword, confirmPassword } = await request.json();

    console.log("Reset password request received");

    // Basic validation
    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { 
          status: "error", 
          message: "Token, new password, and confirm password are required", 
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
          message: "Invalid reset token", 
          success: false 
        },
        { status: 400 }
      );
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { 
          status: "error", 
          message: "Passwords do not match", 
          success: false 
        },
        { status: 400 }
      );
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { 
          status: "error", 
          message: "Password does not meet security requirements", 
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
        `${API_BASE_URL}/auth/update-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Internal-Secret": INTERNAL_SECRET,
          },
          body: JSON.stringify({
            token,
            newPassword,
          }),
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
            message: "Password reset successfully. You can now log in with your new password.",
            success: true,
            data: null
          },
          { status: 200 }
        );
      }

      // Handle specific error cases
      if (response.status === 400) {
        return NextResponse.json(
          { 
            status: "error", 
            message: responseData.message || "Invalid or expired reset token", 
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
            message: "Reset token not found or expired", 
            success: false 
          },
          { status: 404 }
        );
      }

      // Handle other status codes
      return NextResponse.json(
        { 
          status: "error", 
          message: responseData.message || "Failed to reset password. Please try again.", 
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
    console.error("Unexpected error in reset password API:", error);
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