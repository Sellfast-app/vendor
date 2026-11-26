import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function readCookieMap(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return {};

  return cookieHeader.split(";").reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) acc[name] = decodeURIComponent(value);
    return acc;
  }, {} as Record<string, string>);
}

export async function GET(request: NextRequest) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json(
        { status: "error", message: "API base URL is not configured", data: { items: [] } },
        { status: 500 }
      );
    }

    const cookies = readCookieMap(request);
    const token = cookies.accessToken;
    const storeId = cookies.store_id;

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Authentication required", data: { items: [] } },
        { status: 401 }
      );
    }

    if (!storeId) {
      return NextResponse.json(
        { status: "error", message: "Store ID not found", data: { items: [] } },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const queryParams = new URLSearchParams({
      page: searchParams.get("page") || "1",
      pageSize: searchParams.get("pageSize") || "20",
      search: searchParams.get("search") || "",
    });

    const response = await fetch(
      `${API_BASE_URL}/api/stores/${encodeURIComponent(storeId)}/leads?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "GET",
      }
    );
    const responseText = await response.text();
    let data: unknown;
    try {
      data = responseText ? JSON.parse(responseText) : { status: "success", data: { items: [] } };
    } catch {
      data = { status: "error", message: "Unexpected response from leads service", data: { items: [] } };
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Leads API error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error", data: { items: [] } },
      { status: 500 }
    );
  }
}
