import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");

async function forward(request: NextRequest, resource: string) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const storeId = request.cookies.get("store_id")?.value;
  if (!accessToken) return NextResponse.json({ status: "failed", message: "Authentication required" }, { status: 401 });
  if (!storeId) return NextResponse.json({ status: "failed", message: "Store not found for this account" }, { status: 400 });
  if (!API_BASE_URL) return NextResponse.json({ status: "failed", message: "API is not configured" }, { status: 503 });

  const url = new URL(`${API_BASE_URL}/api/vendor/pos/${encodeURIComponent(resource)}`);
  url.searchParams.set("store_id", storeId);
  for (const [key, value] of request.nextUrl.searchParams) {
    if (key !== "store_id") url.searchParams.set(key, value);
  }
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
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

export async function GET(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  const { resource } = await context.params;
  if (!new Set(["terminals", "transactions"]).has(resource)) {
    return NextResponse.json({ status: "failed", message: "Unknown POS resource" }, { status: 404 });
  }
  return forward(request, resource);
}
