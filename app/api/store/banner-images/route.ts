import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const storeId = cookieStore.get("store_id")?.value;
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!storeId) return NextResponse.json({ error: "Store ID not found. Please login again." }, { status: 401 });
  if (!accessToken) return NextResponse.json({ error: "Authentication required. Please login again." }, { status: 401 });
  if (!API_BASE_URL) return NextResponse.json({ error: "Server configuration error" }, { status: 500 });

  const incoming = await request.formData();
  const files = incoming.getAll("banner_images").filter((value): value is File => value instanceof File);
  if (!files.length) return NextResponse.json({ error: "Select at least one image" }, { status: 400 });
  if (files.length > 10) return NextResponse.json({ error: "Upload no more than 10 images at a time" }, { status: 400 });
  if (files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024)) {
    return NextResponse.json({ error: "Images must be JPEG, PNG, or WebP and 10MB or smaller" }, { status: 400 });
  }

  const outgoing = new FormData();
  files.forEach((file) => outgoing.append("banner_images", file, file.name));
  incoming.getAll("existing_images").forEach((image) => {
    if (typeof image === "string") outgoing.append("existing_images", image);
  });
  const carouselSlides = incoming.get("carousel_slides");
  if (typeof carouselSlides === "string") outgoing.append("carousel_slides", carouselSlides);
  const response = await fetch(`${API_BASE_URL}/api/stores/${encodeURIComponent(storeId)}/banner-images`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: outgoing,
    cache: "no-store",
  });
  const body = await response.text();
  let result: unknown;
  try { result = JSON.parse(body); } catch { result = { error: body || "Banner upload failed" }; }
  return NextResponse.json(result, { status: response.status });
}
