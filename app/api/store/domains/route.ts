import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");

function session(request: NextRequest) {
  const storeId = request.cookies.get("store_id")?.value;
  const token = request.cookies.get("accessToken")?.value;
  return storeId && token ? { storeId, token } : null;
}

export async function GET(request: NextRequest) {
  const auth = session(request);
  if (!auth) return NextResponse.json({ status: "failed", message: "Authentication required" }, { status: 401 });
  if (!API_BASE_URL) return NextResponse.json({ status: "failed", message: "API base URL is not configured" }, { status: 500 });
  const response = await fetch(`${API_BASE_URL}/api/stores/${encodeURIComponent(auth.storeId)}/domains`, {
    headers: { Authorization: `Bearer ${auth.token}` }, cache: "no-store",
  });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function POST(request: NextRequest) {
  const auth = session(request);
  if (!auth) return NextResponse.json({ status: "failed", message: "Authentication required" }, { status: 401 });
  if (!API_BASE_URL) return NextResponse.json({ status: "failed", message: "API base URL is not configured" }, { status: 500 });
  const response = await fetch(`${API_BASE_URL}/api/stores/${encodeURIComponent(auth.storeId)}/domains`, {
    method: "POST",
    headers: { Authorization: `Bearer ${auth.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()), cache: "no-store",
  });
  return NextResponse.json(await response.json(), { status: response.status });
}
