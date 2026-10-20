import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function proxyVendorTicketRequest(request: NextRequest, path: string, method: "GET" | "POST" | "PATCH", apiRoot = "/api/vendor/tickets") {
  const token = request.cookies.get("accessToken")?.value;
  const storeId = request.cookies.get("store_id")?.value;
  if (!token) return NextResponse.json({ status: "error", message: "Authentication required" }, { status: 401 });
  if (!API_BASE_URL) return NextResponse.json({ status: "error", message: "Ticket service is not configured" }, { status: 503 });

  const url = new URL(`${API_BASE_URL}${apiRoot}${path ? `/${path}` : ""}`);
  if (method === "GET") {
    if (storeId) url.searchParams.set("store_id", storeId);
    for (const key of ["page", "pageSize", "search", "event_id", "order_status"]) {
      const value = request.nextUrl.searchParams.get(key)?.trim();
      if (value) url.searchParams.set(key, value);
    }
  }

  try {
    const body = method !== "GET" ? await request.json().catch(() => null) : undefined;
    if (method !== "GET" && (!body || typeof body !== "object")) {
      return NextResponse.json({ status: "error", message: "A JSON request body is required" }, { status: 400 });
    }
    const response = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(method !== "GET" ? { "Content-Type": "application/json" } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
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

export async function proxyVendorEventRequest(request: NextRequest, eventId?: string, method: "GET" | "POST" | "PATCH" = "GET") {
  const token = request.cookies.get("accessToken")?.value;
  const storeId = request.cookies.get("store_id")?.value;
  if (!token) return NextResponse.json({ status: "error", message: "Authentication required" }, { status: 401 });
  if (!storeId) return NextResponse.json({ status: "error", message: "Store ID not found" }, { status: 400 });
  if (!API_BASE_URL) return NextResponse.json({ status: "error", message: "Event service is not configured" }, { status: 503 });

  const url = new URL(`${API_BASE_URL}/api/vendor/events${eventId ? `/${encodeURIComponent(eventId)}` : ""}`);
  if (method === "GET") url.searchParams.set("store_id", storeId);
  try {
    const body = method === "GET" ? undefined : await request.json().catch(() => null);
    if (method !== "GET" && (!body || typeof body !== "object" || Array.isArray(body))) {
      return NextResponse.json({ status: "error", message: "Event details are required" }, { status: 400 });
    }
    const payload = method === "POST" ? { store_id: storeId, event: body } : method === "PATCH" ? { event: body } : undefined;
    const response = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(payload ? { "Content-Type": "application/json" } : {}) },
      ...(payload ? { body: JSON.stringify(payload) } : {}),
      cache: "no-store",
    });
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return NextResponse.json({ status: "error", message: "Event service returned an invalid response" }, { status: 502 });
    return NextResponse.json(await response.json(), { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "error", message: "Unable to reach the event service" }, { status: 502 });
  }
}
