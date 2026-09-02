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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const authToken = request.cookies.get("accessToken")?.value;
    const body = await request.json();

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
      `${API_BASE_URL}/api/payments/${storeId}/add-method`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    const responseText = await response.text();
    const data = parseResponse(responseText);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error adding store payment method:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error while adding payment method",
      },
      { status: 500 }
    );
  }
}
