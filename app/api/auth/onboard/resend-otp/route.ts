import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");
const EXTERNAL_API_TIMEOUT = 15000;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getApiMessage(result: Record<string, unknown>, fallback: string) {
  const message = typeof result.message === "string" ? result.message : "";
  if (!message || /<[^>]+>/.test(message)) {
    return fallback;
  }
  return message;
}

function getOnboardingToken(result: Record<string, unknown>) {
  const data = result.data as Record<string, unknown> | undefined;
  return (
    (typeof data?.token === "string" && data.token) ||
    (typeof result.token === "string" && result.token) ||
    null
  );
}

export async function POST(request: Request) {
  try {
    const { user_email } = await request.json();
    const email = user_email?.trim();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { status: "error", message: "Please enter a valid email address", success: false },
        { status: 400 }
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
      const response = await fetch(`${API_BASE_URL}/auth/onboard/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: email }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json")
        ? await response.json()
        : { message: (await response.text()).slice(0, 200) };

      if (!response.ok) {
        console.error("[RESEND_OTP] Upstream resend failed", {
          status: response.status,
          statusText: response.statusText,
          message: getApiMessage(result, "Verification service failed."),
        });
      }

      const nextResponse = NextResponse.json(
        {
          status: response.ok ? "success" : "error",
          message: getApiMessage(
            result,
            response.ok ? "Verification code resent." : "Verification service is temporarily unavailable. Please try again later."
          ),
          success: response.ok,
          ...(process.env.NODE_ENV !== "production" && !response.ok
            ? {
                debug: {
                  upstream_status: response.status,
                  upstream_status_text: response.statusText,
                },
              }
            : {}),
        },
        { status: response.status }
      );

      const token = getOnboardingToken(result);
      if (response.ok && token) {
        nextResponse.cookies.set("onboard_token", token, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          maxAge: 86400,
          secure: process.env.NODE_ENV === "production",
        });
        nextResponse.cookies.set("onboard_email", email, {
          path: "/",
          httpOnly: false,
          sameSite: "lax",
          maxAge: 86400,
          secure: process.env.NODE_ENV === "production",
        });
      } else if (response.ok) {
        console.warn("[RESEND_OTP] Upstream resend response did not include a replacement token", {
          status: response.status,
        });
      }

      return nextResponse;
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("[RESEND_OTP] Upstream resend timed out");
        return NextResponse.json(
          { status: "error", message: "Resend request timed out. Please try again.", success: false },
          { status: 408 }
        );
      }

      console.error("[RESEND_OTP] Unable to reach upstream resend service", fetchError);
      return NextResponse.json(
        { status: "error", message: "Unable to connect to verification service. Please try again later.", success: false },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("[RESEND_OTP] Unexpected error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
