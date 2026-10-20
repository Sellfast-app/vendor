import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return NextResponse.json({ status: "failed", message: "Authentication required" }, { status: 401 });
  if (!API_BASE_URL) return NextResponse.json({ status: "failed", message: "API base URL is not configured" }, { status: 503 });

  const query = new URLSearchParams();
  const currency = request.nextUrl.searchParams.get("currency");
  if (currency) query.set("currency", currency);
  try {
    const response = await fetch(`${API_BASE_URL}/api/v2/wallet${query.size ? `?${query}` : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const body = await response.json().catch(() => ({ status: "failed", message: "Invalid wallet response" }));
    return NextResponse.json(body, { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "failed", message: "Could not connect to wallet service" }, { status: 502 });
  }
}
