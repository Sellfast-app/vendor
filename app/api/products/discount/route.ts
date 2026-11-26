import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function readCookies(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const storeId = request.cookies.get("store_id")?.value;
  return { token, storeId };
}

async function forward(request: NextRequest, method: "GET" | "PUT" | "DELETE") {
  const { token, storeId } = readCookies(request);
  if (!token || !storeId) return NextResponse.json({ status: "error", message: "Authentication and store are required." }, { status: 401 });
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/store/${storeId}/discount`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(method === "PUT" ? { "Content-Type": "application/json" } : {}),
      },
      ...(method === "PUT" ? { body: JSON.stringify(await request.json()) } : {}),
      cache: "no-store",
    });
    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json({ status: "error", message: "Unable to reach the product service." }, { status: 503 });
  }
}

export const GET = (request: NextRequest) => forward(request, "GET");
export const PUT = (request: NextRequest) => forward(request, "PUT");
export const DELETE = (request: NextRequest) => forward(request, "DELETE");
