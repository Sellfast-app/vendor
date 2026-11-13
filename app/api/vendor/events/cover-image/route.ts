import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const storeId = request.cookies.get("store_id")?.value;
  if (!token) return NextResponse.json({ status: "failed", message: "Authentication required" }, { status: 401 });
  if (!storeId) return NextResponse.json({ status: "failed", message: "Store ID not found" }, { status: 400 });
  if (!API_BASE_URL) return NextResponse.json({ status: "failed", message: "Event service is not configured" }, { status: 503 });

  try {
    const incoming = await request.formData();
    const image = incoming.get("image");
    if (!(image instanceof File)) {
      return NextResponse.json({ status: "failed", message: "An event cover image is required" }, { status: 400 });
    }
    const outgoing = new FormData();
    outgoing.append("store_id", storeId);
    outgoing.append("image", image, image.name);
    const response = await fetch(`${API_BASE_URL}/api/vendor/events/cover-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: outgoing,
      cache: "no-store",
    });
    const text = await response.text();
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      body = { status: "failed", message: text || "Event cover image upload failed" };
    }
    return NextResponse.json(body, { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "failed", message: "Unable to upload event cover image" }, { status: 502 });
  }
}
