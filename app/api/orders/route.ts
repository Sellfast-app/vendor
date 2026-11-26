import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const queryKeys = [
  "page",
  "pageSize",
  "order_status",
  "payment_status",
  "payment_method",
  "delivery_method",
  "sales_channel",
  "search",
  "date_from",
  "date_to",
] as const;

export async function GET(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const storeId = request.cookies.get("store_id")?.value;
  if (!token) return NextResponse.json({ status: "error", message: "Authentication required" }, { status: 401 });
  if (!storeId) return NextResponse.json({ status: "error", message: "Store ID not found" }, { status: 400 });
  if (!API_BASE_URL) return NextResponse.json({ status: "error", message: "API base URL is not configured" }, { status: 500 });

  const params = new URLSearchParams();
  const incoming = request.nextUrl.searchParams;
  for (const key of queryKeys) {
    const value = incoming.get(key)?.trim();
    if (value) params.set(key, value);
  }
  if (!params.has("page")) params.set("page", "1");
  if (!params.has("pageSize")) params.set("pageSize", "20");

  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/store/${storeId}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json(
        { status: "error", message: payload?.message || `Failed to load orders (${response.status})` },
        { status: response.status },
      );
    }
    return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "error", message: "Could not connect to orders service" }, { status: 502 });
  }
}
