// app/api/subscription/create/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_SUBSCRIPTION_BASE_URL;

interface SubscriptionRequest {
  user: {
    uid: string;
    email: string;
  };
  isTrial: boolean;
  type: "weekly" | "monthly" | "annually" | "biannually";
}

export async function POST(request: NextRequest) {
  try {
    // Get user_id and email from cookies
    const cookieHeader = request.headers.get("cookie");
    let userId = null;
    let userEmail = null;

    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      
      userId = cookies.user_id || null;
      userEmail = cookies.user_email || null;
    }

    if (!userId) {
      console.error("[SUBSCRIPTION] User ID not found in cookies");
      return NextResponse.json(
        { status: "error", message: "User ID not found. Please log in again." },
        { status: 401 }
      );
    }

    if (!userEmail) {
      console.error("[SUBSCRIPTION] User email not found in cookies");
      return NextResponse.json(
        { status: "error", message: "User email not found. Please log in again." },
        { status: 401 }
      );
    }

    // Get subscription type from request body (optional, defaults to monthly)
    const body = await request.json().catch(() => ({}));
    const subscriptionType = body.type || "monthly";
    const isTrial = body.isTrial ?? false;

    // Prepare subscription request
    const subscriptionData: SubscriptionRequest = {
      user: {
        uid: userId,
        email: decodeURIComponent(userEmail), // Decode in case email was encoded
      },
      isTrial,
      type: subscriptionType,
    };

    console.log("[SUBSCRIPTION] Creating subscription:", {
      uid: userId,
      email: subscriptionData.user.email,
      type: subscriptionType,
      isTrial,
    });

    // Call external API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(`${API_BASE_URL}/api/subscription/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscriptionData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("[SUBSCRIPTION] API response status:", response.status);

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      let result;

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
        console.log("[SUBSCRIPTION] API response:", JSON.stringify(result, null, 2));
      } else {
        const textResponse = await response.text();
        console.error("[SUBSCRIPTION] Non-JSON response:", textResponse.substring(0, 200));
        result = { message: textResponse.substring(0, 200) };
      }

      if (!response.ok) {
        console.error("[SUBSCRIPTION] Failed with status:", response.status);
        return NextResponse.json(
          {
            status: "error",
            message: result.message || "Failed to create subscription. Please try again.",
          },
          { status: response.status }
        );
      }

      console.log("[SUBSCRIPTION] ✅ Subscription created successfully");

      return NextResponse.json({
        status: "success",
        message: result.message || "Subscription created successfully",
        data: result.data || result,
      });

    }   // eslint-disable-next-line @typescript-eslint/no-explicit-any 
    catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === "AbortError") {
        console.error("[SUBSCRIPTION] Request timeout");
        return NextResponse.json(
          {
            status: "error",
            message: "Subscription request timed out. Please try again.",
          },
          { status: 408 }
        );
      }

      console.error("[SUBSCRIPTION] API connection error:", fetchError);
      return NextResponse.json(
        {
          status: "error",
          message: "Unable to connect to subscription service. Please try again later.",
        },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error("[SUBSCRIPTION] Unexpected error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}