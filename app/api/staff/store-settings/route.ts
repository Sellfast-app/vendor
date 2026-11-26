import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");

export async function GET() {
  const cookieStore = await cookies();
  const storeId = cookieStore.get("store_id")?.value;
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!storeId || !accessToken) {
    return NextResponse.json({ status: "failed", message: "Staff session or store is unavailable" }, { status: 401 });
  }
  if (!API_BASE_URL) {
    return NextResponse.json({ status: "failed", message: "API service is not configured" }, { status: 503 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/stores/${encodeURIComponent(storeId)}/full`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ status: "failed", message: "Store settings service returned an invalid response" }, { status: 502 });
    }
    return NextResponse.json(await response.json(), { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "failed", message: "Unable to load store settings" }, { status: 502 });
  }
}
