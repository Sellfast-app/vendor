import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");

async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const storeId = request.cookies.get("store_id")?.value;
  if (!accessToken) return NextResponse.json({ status: "failed", message: "Authentication required" }, { status: 401 });
  if (!storeId) return NextResponse.json({ status: "failed", message: "Store not found for this account" }, { status: 400 });
  if (!API_BASE_URL) return NextResponse.json({ status: "failed", message: "API is not configured" }, { status: 503 });

  try {
    const body = request.method === "POST" ? await request.json() : undefined;
    const response = await fetch(`${API_BASE_URL}/api/vendor/pos-requests`, {
      method: request.method,
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify({ ...body, store_id: storeId }) } : {}),
      cache: "no-store",
    });
    const text = await response.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { status: "failed", message: text || "Unexpected API response" }; }
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ status: "failed", message: "Unable to reach the API" }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
