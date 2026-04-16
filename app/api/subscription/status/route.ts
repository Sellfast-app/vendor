import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_SUBSCRIPTION_BASE_URL;

export async function GET(request: NextRequest) {
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
      return NextResponse.json({ hasActiveSubscription: false }, { status: 200 });
    }

    console.log("[SUBSCRIPTION_STATUS] Checking for user:", userId);

    const response = await fetch(`${API_BASE_URL}/api/subscription/find/${userId}`);

    if (response.status === 404) {
      return NextResponse.json({ hasActiveSubscription: false });
    }

    const result = await response.json();
    console.log("[SUBSCRIPTION_STATUS] API response:", result);

    if (result.data?.expireAt) {
      const isActive = new Date(result.data.expireAt) > new Date();
      return NextResponse.json({ hasActiveSubscription: isActive, data: result.data });
    }

    return NextResponse.json({ hasActiveSubscription: false });

  } catch (error) {
    console.error("[SUBSCRIPTION_STATUS] Error:", error);
    return NextResponse.json({ hasActiveSubscription: false });
  }
}