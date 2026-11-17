import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const storeId = request.cookies.get("store_id")?.value;
  if (!token) return NextResponse.json({ status: "error", message: "Authentication required" }, { status: 401 });
  if (!storeId) return NextResponse.json({ status: "error", message: "Store ID not found" }, { status: 400 });
  if (!API_BASE_URL) return NextResponse.json({ status: "error", message: "Ticket export is not configured" }, { status: 503 });

  const upstreamUrl = new URL(`${API_BASE_URL}/api/vendor/ticket-orders/export`);
  upstreamUrl.searchParams.set("store_id", storeId);
  for (const key of ["dataset", "format", "event_id", "start", "end"]) {
    const value = request.nextUrl.searchParams.get(key)?.trim();
    if (value) upstreamUrl.searchParams.set(key, value);
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!upstream.ok) {
      const contentType = upstream.headers.get("content-type") || "";
      if (contentType.includes("application/json")) return NextResponse.json(await upstream.json(), { status: upstream.status });
      return NextResponse.json({ status: "error", message: "Ticket export failed" }, { status: upstream.status });
    }
    const headers = new Headers({ "Cache-Control": "no-store" });
    const contentType = upstream.headers.get("content-type");
    const disposition = upstream.headers.get("content-disposition");
    if (contentType) headers.set("Content-Type", contentType);
    if (disposition) headers.set("Content-Disposition", disposition);
    return new NextResponse(await upstream.arrayBuffer(), { status: 200, headers });
  } catch {
    return NextResponse.json({ status: "error", message: "Unable to reach the ticket export service" }, { status: 502 });
  }
}
