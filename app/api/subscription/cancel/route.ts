import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_SUBSCRIPTION_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie");
    let userId = null;

    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);

      userId = cookies.user_id || cookies.vendor_id || null;
    }

    if (!userId) {
      return NextResponse.json(
        { status: "error", message: "User ID not found. Please log in again." },
        { status: 401 }
      );
    }

    console.log("[CANCEL_SUBSCRIPTION] Cancelling subscription for user:", userId);

    const response = await fetch(`${API_BASE_URL}/api/subscription/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userUid: userId }),
    });

    const result = await response.json();

    console.log("[CANCEL_SUBSCRIPTION] API response:", result);

    if (!response.ok) {
      return NextResponse.json(
        { status: "error", message: result.message || "Failed to cancel subscription." },
        { status: response.status }
      );
    }

    return NextResponse.json({
      status: "success",
      message: result.message || "Subscription cancelled successfully",
    });

  } catch (error) {
    console.error("[CANCEL_SUBSCRIPTION] Error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}