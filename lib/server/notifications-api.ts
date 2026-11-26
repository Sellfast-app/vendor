import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function proxyNotificationRequest(request: NextRequest, path: string, method = request.method, body?: unknown) {
  const token = request.cookies.get("accessToken")?.value;
  if (!token) return NextResponse.json({ status: "failed", message: "Authentication required" }, { status: 401 });
  if (!API_BASE_URL) return NextResponse.json({ status: "failed", message: "Notification service is not configured" }, { status: 503 });

  const url = new URL(`${API_BASE_URL}/api/notifications${path}`);
  const storeId = request.cookies.get("store_id")?.value;
  if (method === "GET") {
    for (const key of ["page", "pageSize", "unread", "search"]) {
      const value = request.nextUrl.searchParams.get(key);
      if (value) url.searchParams.set(key, value);
    }
    if (storeId) url.searchParams.set("storeId", storeId);
  }
  try {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify({ ...(body as object), ...(storeId ? { storeId } : {}) }) } : {}),
      cache: "no-store",
    });
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ status: "failed", message: "Notification service returned an invalid response" }, { status: 502 });
    }
    return NextResponse.json(await response.json(), { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "failed", message: "Unable to reach the notification service" }, { status: 502 });
  }
}
