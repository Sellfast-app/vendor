import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function auth(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const storeId = request.cookies.get("store_id")?.value;
  return token && storeId ? { token, storeId } : null;
}

export async function GET(request: NextRequest) {
  const session = auth(request);
  if (!session) return NextResponse.json({ status: "error", message: "Authentication required" }, { status: 401 });
  if (!API_BASE_URL) return NextResponse.json({ status: "error", message: "API base URL is not configured" }, { status: 500 });
  const response = await fetch(`${API_BASE_URL}/api/stores/${encodeURIComponent(session.storeId)}/branches`, { cache: "no-store" });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function POST(request: NextRequest) {
  const session = auth(request);
  if (!session) return NextResponse.json({ status: "error", message: "Authentication required" }, { status: 401 });
  if (!API_BASE_URL) return NextResponse.json({ status: "error", message: "API base URL is not configured" }, { status: 500 });
  const response = await fetch(`${API_BASE_URL}/api/stores/${encodeURIComponent(session.storeId)}/branches`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });
  return NextResponse.json(await response.json(), { status: response.status });
}
