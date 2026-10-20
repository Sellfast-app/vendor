import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function proxyVendorStaffRequest(request: NextRequest, path: string[] = []) {
  const token = request.cookies.get("accessToken")?.value;
  if (!token) return NextResponse.json({ status: "error", message: "Authentication required" }, { status: 401 });
  if (!API_BASE_URL) return NextResponse.json({ status: "error", message: "Staff service is not configured" }, { status: 503 });

  const method = request.method;
  const key = path.join("/");
  const valid =
    (key === "" && ["GET", "POST"].includes(method)) ||
    (["roles", "invitations"].includes(key) && ["GET", "POST"].includes(method)) ||
    (key === "audit-log" && method === "GET") ||
    (key === "invitations/accept" && method === "POST") ||
    ((/^roles\/[0-9a-f-]{36}$/i.test(key) || /^[0-9a-f-]{36}$/i.test(key)) && ["PATCH", "DELETE"].includes(method)) ||
    (/^invitations\/[0-9a-f-]{36}$/i.test(key) && method === "DELETE");
  if (!valid) return NextResponse.json({ status: "error", message: "Unsupported staff operation" }, { status: 404 });

  const url = new URL(`${API_BASE_URL}/api/vendor/staff${path.length ? `/${path.map(encodeURIComponent).join("/")}` : ""}`);
  if (method === "GET") {
    for (const name of ["limit", "offset"]) {
      const value = request.nextUrl.searchParams.get(name);
      if (value) url.searchParams.set(name, value);
    }
  }
  try {
    const body = ["GET", "HEAD"].includes(method) ? undefined : await request.json().catch(() => null);
    if (body === null && !["GET", "DELETE"].includes(method)) {
      return NextResponse.json({ status: "error", message: "A JSON request body is required" }, { status: 400 });
    }
    const response = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body !== undefined ? { "Content-Type": "application/json" } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return NextResponse.json({ status: "error", message: "Staff service returned an invalid response" }, { status: 502 });
    return NextResponse.json(await response.json(), { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "error", message: "Unable to reach the staff service" }, { status: 502 });
  }
}
