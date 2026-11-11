import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");

export async function PATCH(request: NextRequest) {
  if (!API_BASE_URL) {
    return NextResponse.json({ message: "Store API is not configured" }, { status: 503 });
  }

  const cookieStore = await cookies();
  const storeId = cookieStore.get("store_id")?.value;
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!storeId || !accessToken) {
    return NextResponse.json({ message: "Authentication required. Please login again." }, { status: 401 });
  }

  let body: { is_manually_closed?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof body.is_manually_closed !== "boolean") {
    return NextResponse.json({ message: "is_manually_closed must be a boolean" }, { status: 400 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/stores/${encodeURIComponent(storeId)}/manual-closure`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_manually_closed: body.is_manually_closed }),
      cache: "no-store",
    });
    const text = await response.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: "Unexpected response from store API" };
    }
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ message: "Unable to update store status" }, { status: 502 });
  }
}
