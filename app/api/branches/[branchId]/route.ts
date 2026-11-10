import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function forward(request: NextRequest, params: Promise<{ branchId: string }>, action: "PATCH" | "DELETE" | "GET" | "PUT") {
  const token = request.cookies.get("accessToken")?.value;
  const storeId = request.cookies.get("store_id")?.value;
  const { branchId } = await params;
  if (!token || !storeId) return NextResponse.json({ status: "error", message: "Authentication required" }, { status: 401 });
  if (!API_BASE_URL) return NextResponse.json({ status: "error", message: "API base URL is not configured" }, { status: 500 });
  const suffix = request.nextUrl.pathname.endsWith("/overrides") ? "/overrides" : "";
  const response = await fetch(`${API_BASE_URL}/api/stores/${encodeURIComponent(storeId)}/branches/${encodeURIComponent(branchId)}${suffix}`, {
    method: action,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    ...(action === "PATCH" || action === "PUT" ? { body: JSON.stringify(await request.json()) } : {}),
    cache: "no-store",
  });
  return NextResponse.json(await response.json(), { status: response.status });
}

type Context = { params: Promise<{ branchId: string }> };
export function PATCH(request: NextRequest, { params }: Context) { return forward(request, params, "PATCH"); }
export function DELETE(request: NextRequest, { params }: Context) { return forward(request, params, "DELETE"); }
export function GET(request: NextRequest, { params }: Context) { return forward(request, params, "GET"); }
export function PUT(request: NextRequest, { params }: Context) { return forward(request, params, "PUT"); }
