import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const storeId = request.cookies.get("store_id")?.value;
  if (!token) return NextResponse.json({ status: "error", message: "Authentication required" }, { status: 401 });
  if (!storeId) return NextResponse.json({ status: "error", message: "Store ID not found" }, { status: 400 });
  if (!API_BASE_URL) return NextResponse.json({ status: "error", message: "API base URL is not configured" }, { status: 503 });

  const query = new URLSearchParams();
  for (const key of ["format", "startDate", "endDate"]) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) query.set(key, value);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/analytics/store/${storeId}/export?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) return NextResponse.json(await response.json(), { status: response.status });
      return NextResponse.json({ status: "error", message: "Analytics export failed" }, { status: response.status });
    }
    const headers = new Headers({ "Cache-Control": "no-store" });
    const contentType = response.headers.get("content-type");
    const disposition = response.headers.get("content-disposition");
    if (contentType) headers.set("Content-Type", contentType);
    if (disposition) headers.set("Content-Disposition", disposition);
    return new NextResponse(await response.arrayBuffer(), { headers });
  } catch {
    return NextResponse.json({ status: "error", message: "Unable to reach analytics service" }, { status: 502 });
  }
}
