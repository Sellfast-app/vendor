import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");

async function forward(request: NextRequest, params: Promise<{ branchId: string }>, method: "GET" | "PUT") {
  const token = request.cookies.get("accessToken")?.value;
  const storeId = request.cookies.get("store_id")?.value;
  const { branchId } = await params;
  if (!token || !storeId) return NextResponse.json({ status: "error", message: "Authentication required" }, { status: 401 });
  if (!API_BASE_URL) return NextResponse.json({ status: "error", message: "API base URL is not configured" }, { status: 500 });

  try {
    const response = await fetch(`${API_BASE_URL}/api/stores/${encodeURIComponent(storeId)}/branches/${encodeURIComponent(branchId)}/overrides`, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(method === "PUT" ? { "Content-Type": "application/json" } : {}) },
      ...(method === "PUT" ? { body: JSON.stringify(await request.json()) } : {}),
      cache: "no-store",
    });
    const text = await response.text();
    let payload: unknown;
    try { payload = text ? JSON.parse(text) : {}; }
    catch { payload = { status: "error", message: "Unexpected response from branch catalog service" }; }
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ status: "error", message: "Unable to reach branch catalog service" }, { status: 502 });
  }
}

type Context = { params: Promise<{ branchId: string }> };
export function GET(request: NextRequest, { params }: Context) { return forward(request, params, "GET"); }
export function PUT(request: NextRequest, { params }: Context) { return forward(request, params, "PUT"); }
