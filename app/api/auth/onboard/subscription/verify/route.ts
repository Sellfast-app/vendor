import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");

export async function POST(request: NextRequest) {
  const token = request.cookies.get("onboard_token")?.value;
  if (!token) {
    return NextResponse.json({ status: "error", message: "Signup session expired. Sign up again.", success: false }, { status: 401 });
  }
  if (!API_BASE_URL) {
    return NextResponse.json({ status: "error", message: "Onboarding service is not configured.", success: false }, { status: 500 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v2/onboarding/subscription/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(await request.json()),
      cache: "no-store",
      signal: AbortSignal.timeout(25000),
    });
    const result = await response.json();
    const nextResponse = NextResponse.json({
      ...result,
      success: response.ok && result.status === "success",
    }, { status: response.status });

    if (response.ok && result.status === "success" && result.data) {
      const cookieOptions = {
        path: "/",
        httpOnly: true,
        sameSite: "lax" as const,
        maxAge: 86400,
        secure: process.env.NODE_ENV === "production",
      };
      nextResponse.cookies.set("accessToken", token, cookieOptions);
      const store = result.data;
      if (store.store_id) {
        nextResponse.cookies.set("store_id", String(store.store_id), { ...cookieOptions, httpOnly: false, maxAge: 2592000 });
      }
      if (store.store_name) {
        nextResponse.cookies.set("store_name", String(store.store_name), { ...cookieOptions, httpOnly: false, maxAge: 2592000 });
      }
      if (store.store_url) {
        nextResponse.cookies.set("store_url", String(store.store_url), { ...cookieOptions, httpOnly: false, maxAge: 2592000 });
      }
      if (store.user_id) {
        nextResponse.cookies.set("user_id", String(store.user_id), { ...cookieOptions, httpOnly: false, maxAge: 2592000 });
      }
    }
    return nextResponse;
  } catch {
    return NextResponse.json({ status: "error", message: "Unable to verify subscription payment.", success: false }, { status: 502 });
  }
}
