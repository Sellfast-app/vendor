import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");

async function forward(request: NextRequest, method: "GET" | "PUT") {
  const token = request.cookies.get("accessToken")?.value;
  const storeId = request.cookies.get("store_id")?.value;
  if (!token || !storeId) return NextResponse.json({ status: "error", message: "Authentication required" }, { status: 401 });
  if (!API_BASE_URL) return NextResponse.json({ status: "error", message: "API base URL is not configured" }, { status: 503 });
  try {
    const response = await fetch(`${API_BASE_URL}/api/stores/${encodeURIComponent(storeId)}/food-taxonomy`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      ...(method === "PUT" ? { body: JSON.stringify(await request.json()) } : {}),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const text = await response.text();
    let payload: unknown;
    try { payload = text ? JSON.parse(text) : {}; }
    catch { payload = { status: "error", message: "Unexpected response from food settings service" }; }
    return NextResponse.json(payload, { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "error", message: "Unable to reach food settings service" }, { status: 502 });
  }
}

export function GET(request: NextRequest) { return forward(request, "GET"); }
export function PUT(request: NextRequest) { return forward(request, "PUT"); }
