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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const authToken = request.cookies.get("accessToken")?.value;

    if (!authToken) {
      return NextResponse.json(
        {
          status: "error",
          message: "Authentication required. Please login again.",
        },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/payments/${storeId}/payment-methods`,
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
    console.error("Error fetching store payment methods:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error while fetching payment methods",
      },
      { status: 500 }
    );
  }
}
