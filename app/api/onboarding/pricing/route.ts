import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");

export async function GET(request: NextRequest) {
  if (!API_BASE_URL) {
    return NextResponse.json(
      { status: "error", message: "Onboarding service is not configured.", data: null },
      { status: 500 },
    );
  }

  const currency = request.nextUrl.searchParams.get("currency")?.toUpperCase();
  if (!currency) {
    return NextResponse.json(
      { status: "error", message: "Currency is required.", data: null },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v2/onboarding/pricing?currency=${encodeURIComponent(currency)}`,
      { cache: "no-store", signal: AbortSignal.timeout(15000) },
    );
    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Unable to retrieve subscription pricing.", data: null },
      { status: 502 },
    );
  }
}
