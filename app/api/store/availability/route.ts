import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  ?.trim()
  .replace(/\/+$/, "");

interface AvailabilityEntry {
  day: string;
  openTime: string;
  closeTime: string;
}

const validDays = new Set([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function isAvailabilityEntry(value: unknown): value is AvailabilityEntry {
  if (!value || typeof value !== "object") return false;

  const entry = value as Partial<AvailabilityEntry>;
  return (
    typeof entry.day === "string" &&
    validDays.has(entry.day) &&
    typeof entry.openTime === "string" &&
    timePattern.test(entry.openTime) &&
    typeof entry.closeTime === "string" &&
    timePattern.test(entry.closeTime)
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json(
        { error: "Store API is not configured" },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const storeId = cookieStore.get("store_id")?.value;
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID not found. Please login again." },
        { status: 401 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentication required. Please login again." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const availableDateTimes = body?.availableDateTimes;

    if (
      !Array.isArray(availableDateTimes) ||
      availableDateTimes.length === 0 ||
      !availableDateTimes.every(isAvailabilityEntry)
    ) {
      return NextResponse.json(
        {
          error:
            "availableDateTimes must contain valid days and HH:mm opening and closing times",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/stores/${encodeURIComponent(storeId)}/availability`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ availableDateTimes }),
        cache: "no-store",
      }
    );

    const responseText = await response.text();
    let responseData: Record<string, unknown>;

    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch {
      responseData = {};
    }

    if (!response.ok) {
      const message =
        (typeof responseData.message === "string" && responseData.message) ||
        (typeof responseData.error === "string" && responseData.error) ||
        responseText ||
        "Failed to update store availability";

      return NextResponse.json(
        { error: message },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        ...responseData,
        message:
          (typeof responseData.message === "string" && responseData.message) ||
          "Availability updated successfully",
      },
      { status: response.status }
    );
  } catch (error) {
    console.error("Error updating store availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
