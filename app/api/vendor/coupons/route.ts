import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function forward(request: NextRequest, method: "GET" | "POST") {
  const token = request.cookies.get("accessToken")?.value;
  const storeId = request.cookies.get("store_id")?.value;
  if (!token || !storeId) return NextResponse.json({ status: "failed", message: "Authentication and store are required" }, { status: 401 });
  if (!API_BASE_URL) return NextResponse.json({ status: "failed", message: "API is not configured" }, { status: 500 });
  try {
    const response = await fetch(`${API_BASE_URL}/api/vendor/coupons/stores/${encodeURIComponent(storeId)}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
      },
      ...(method === "POST" ? { body: JSON.stringify(await request.json()) } : {}),
      cache: "no-store",
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ status: "failed", message: "Unable to reach the coupon service" }, { status: 503 });
  }
}

export const GET = (request: NextRequest) => forward(request, "GET");
export const POST = (request: NextRequest) => forward(request, "POST");
