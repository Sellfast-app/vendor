import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");

async function forward(request: NextRequest, domainId: string, method: "POST" | "DELETE") {
  const storeId = request.cookies.get("store_id")?.value;
  const token = request.cookies.get("accessToken")?.value;
  if (!storeId || !token) return NextResponse.json({ status: "failed", message: "Authentication required" }, { status: 401 });
  if (!API_BASE_URL) return NextResponse.json({ status: "failed", message: "API base URL is not configured" }, { status: 500 });
  const action = method === "DELETE" ? "" : "/verify";
  const response = await fetch(`${API_BASE_URL}/api/stores/${encodeURIComponent(storeId)}/domains/${encodeURIComponent(domainId)}${action}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const text = await response.text();
  let payload: unknown;
  try { payload = text ? JSON.parse(text) : {}; } catch { payload = { status: "failed", message: text || "Invalid API response" }; }
  return NextResponse.json(payload, { status: response.status });
}

export async function POST(request: NextRequest, context: { params: Promise<{ domainId: string }> }) {
  const { domainId } = await context.params;
  return forward(request, domainId, "POST");
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ domainId: string }> }) {
  const { domainId } = await context.params;
  return forward(request, domainId, "DELETE");
}
