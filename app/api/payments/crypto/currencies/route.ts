import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const parseResponse = (responseText: string) => {
  if (!responseText) return {};
  try {
    return JSON.parse(responseText);
  } catch {
    return { status: "error", message: responseText };
  }
};

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get("accessToken")?.value;
    const { searchParams } = new URL(request.url);
    const network = searchParams.get("network");

    if (!authToken) {
      return NextResponse.json(
        {
          status: "error",
          message: "Authentication required. Please login again.",
        },
        { status: 401 }
      );
    }

    if (!network) {
      return NextResponse.json(
        {
          status: "error",
          message: "Network is required",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/payments/get-supported-currency?network=${encodeURIComponent(network)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        cache: "no-store",
      }
    );

    const responseText = await response.text();
    const data = parseResponse(responseText);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching supported crypto currencies:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error while fetching supported currencies",
      },
      { status: 500 }
    );
  }
}
