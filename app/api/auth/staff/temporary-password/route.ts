import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");

export async function POST(request: Request) {
  if (!API_BASE_URL) return NextResponse.json({ status: "failed", message: "Authentication service is not configured" }, { status: 503 });
  try {
    const body = await request.json();
    const response = await fetch(`${API_BASE_URL}/auth/staff/temporary-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ status: "failed", message: "Authentication service returned an invalid response" }, { status: 502 });
    }
    return NextResponse.json(await response.json(), { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "failed", message: "Unable to reach the authentication service" }, { status: 502 });
  }
}
