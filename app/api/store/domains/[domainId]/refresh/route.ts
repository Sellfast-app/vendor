import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");

export async function POST(request: NextRequest, context: { params: Promise<{ domainId: string }> }) {
  const storeId = request.cookies.get("store_id")?.value;
  const token = request.cookies.get("accessToken")?.value;
  if (!storeId || !token) return NextResponse.json({ status: "failed", message: "Authentication required" }, { status: 401 });
  if (!API_BASE_URL) return NextResponse.json({ status: "failed", message: "API base URL is not configured" }, { status: 500 });
  const { domainId } = await context.params;
  const response = await fetch(`${API_BASE_URL}/api/stores/${encodeURIComponent(storeId)}/domains/${encodeURIComponent(domainId)}/refresh`, {
    method: "POST", headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
  });
  const text = await response.text();
  let payload: unknown;
  try { payload = text ? JSON.parse(text) : {}; } catch { payload = { status: "failed", message: text || "Invalid API response" }; }
  return NextResponse.json(payload, { status: response.status });
}
