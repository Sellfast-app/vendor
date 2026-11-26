import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");

export async function GET(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  if (!token) return NextResponse.json({ status: "error", message: "Please sign in again." }, { status: 401 });
  if (!API_BASE_URL) return NextResponse.json({ status: "error", message: "Billing service is not configured." }, { status: 503 });
  try {
    const response = await fetch(`${API_BASE_URL}/api/v2/billing`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(15000),
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ status: "error", message: "Unable to load billing status." }, { status: 502 });
  }
}
