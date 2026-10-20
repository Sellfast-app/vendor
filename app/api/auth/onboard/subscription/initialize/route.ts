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
    const response = await fetch(`${API_BASE_URL}/api/v2/onboarding/subscription/initialize`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(await request.json()),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    const result = await response.json();
    return NextResponse.json({
      ...result,
      success: response.ok && result.status === "success",
    }, { status: response.status });
  } catch {
    return NextResponse.json({ status: "error", message: "Unable to start subscription checkout.", success: false }, { status: 502 });
  }
}
