import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");

export async function POST(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  if (!token) return NextResponse.json({ status: "error", message: "Authentication required" }, { status: 401 });
  if (!API_BASE_URL) return NextResponse.json({ status: "error", message: "API base URL is not configured" }, { status: 503 });
  try {
    const response = await fetch(`${API_BASE_URL}/api/v2/payment-methods/seerbit/resolve-account`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(await request.json()),
      cache: "no-store",
    });
    const text = await response.text();
    let data: unknown;
    try { data = text ? JSON.parse(text) : {}; }
    catch { data = { status: "error", message: "Unexpected response from account verification service" }; }
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ status: "error", message: "Unable to verify bank account" }, { status: 502 });
  }
}
