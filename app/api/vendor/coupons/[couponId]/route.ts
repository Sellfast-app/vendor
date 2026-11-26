import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function PATCH(request: NextRequest, context: { params: Promise<{ couponId: string }> }) {
  const token = request.cookies.get("accessToken")?.value;
  const storeId = request.cookies.get("store_id")?.value;
  if (!token || !storeId) return NextResponse.json({ status: "failed", message: "Authentication and store are required" }, { status: 401 });
  if (!API_BASE_URL) return NextResponse.json({ status: "failed", message: "API is not configured" }, { status: 500 });
  try {
    const { couponId } = await context.params;
    const response = await fetch(`${API_BASE_URL}/api/vendor/coupons/stores/${encodeURIComponent(storeId)}/${encodeURIComponent(couponId)}/deactivate`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ status: "failed", message: "Unable to reach the coupon service" }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ couponId: string }> }) {
  const token = request.cookies.get("accessToken")?.value;
  const storeId = request.cookies.get("store_id")?.value;
  if (!token || !storeId) return NextResponse.json({ status: "failed", message: "Authentication and store are required" }, { status: 401 });
  if (!API_BASE_URL) return NextResponse.json({ status: "failed", message: "API is not configured" }, { status: 500 });
  try {
    const { couponId } = await context.params;
    const response = await fetch(`${API_BASE_URL}/api/vendor/coupons/stores/${encodeURIComponent(storeId)}/${encodeURIComponent(couponId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ status: "failed", message: "Unable to reach the coupon service" }, { status: 503 });
  }
}
