import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  if (!token) return NextResponse.json({ status: "error", message: "Authentication required" }, { status: 401 });
  if (!API_BASE_URL) return NextResponse.json({ status: "error", message: "Ticket service is not configured" }, { status: 503 });

  const url = new URL(`${API_BASE_URL}/api/vendor/tickets/check-ins`);
  for (const key of ["event_id", "page", "pageSize"]) {
    const value = request.nextUrl.searchParams.get(key)?.trim();
    if (value) url.searchParams.set(key, value);
  }

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ status: "error", message: "Ticket service returned an invalid response" }, { status: 502 });
    }
    return NextResponse.json(await response.json(), {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ status: "error", message: "Unable to reach the ticket service" }, { status: 502 });
  }
}
