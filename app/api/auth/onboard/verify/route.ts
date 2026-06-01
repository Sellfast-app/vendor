import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");
const EXTERNAL_API_TIMEOUT = 15000;

function getApiMessage(result: Record<string, unknown>, fallback: string) {
  const message = typeof result.message === "string" ? result.message : "";
  if (!message || /<[^>]+>/.test(message)) {
    return fallback;
  }
  return message;
}

export async function POST(request: NextRequest) {
  try {
    const { otp } = await request.json();
    const token = request.cookies.get("onboard_token")?.value;

    if (!otp?.trim()) {
      return NextResponse.json(
        { status: "error", message: "OTP code is required", success: false },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Verification session expired. Please start signup again.", success: false },
        { status: 401 }
      );
    }

    if (!API_BASE_URL) {
      return NextResponse.json(
        { status: "error", message: "Authentication service is not configured.", success: false },
        { status: 500 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EXTERNAL_API_TIMEOUT);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/onboard/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp: otp.trim() }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json")
        ? await response.json()
        : { message: (await response.text()).slice(0, 200) };

      if (!response.ok) {
        console.error("[VERIFY_OTP] Upstream verify failed", {
          status: response.status,
          statusText: response.statusText,
          body: result,
        });
      }

      return NextResponse.json(
        {
          status: response.ok ? "success" : "error",
          message: getApiMessage(
            result,
            response.ok ? "Email verified successfully." : "Verification service is temporarily unavailable. Please try again later."
          ),
          success: response.ok,
          data: result.data || null,
          ...(process.env.NODE_ENV !== "production" && !response.ok
            ? {
                debug: {
                  upstream_status: response.status,
                  upstream_status_text: response.statusText,
                  upstream_response: result,
                },
              }
            : {}),
        },
        { status: response.status }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("[VERIFY_OTP] Upstream verify timed out");
        return NextResponse.json(
          { status: "error", message: "Verification request timed out. Please try again.", success: false },
          { status: 408 }
        );
      }

      console.error("[VERIFY_OTP] Unable to reach upstream verify service", fetchError);
      return NextResponse.json(
        { status: "error", message: "Unable to connect to verification service. Please try again later.", success: false },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("[VERIFY_OTP] Unexpected error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
