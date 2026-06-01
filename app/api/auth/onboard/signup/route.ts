import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");
const EXTERNAL_API_TIMEOUT = 15000;

interface SignupRequest {
  first_name: string;
  last_name: string;
  user_email: string;
  user_password: string;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getOnboardingToken(result: Record<string, unknown>) {
  const data = result.data as Record<string, unknown> | undefined;
  return (
    (typeof data?.token === "string" && data.token) ||
    (typeof result.token === "string" && result.token) ||
    null
  );
}

function getApiMessage(result: Record<string, unknown>, fallback: string) {
  const message = typeof result.message === "string" ? result.message : "";
  if (!message || /<[^>]+>/.test(message)) {
    return fallback;
  }
  return message;
}

function getErrorPayload(
  result: Record<string, unknown>,
  response: Response,
  fallback: string
) {
  const payload: Record<string, unknown> = {
    status: "error",
    message: getApiMessage(result, fallback),
    success: false,
  };

  if (process.env.NODE_ENV !== "production") {
    payload.debug = {
      upstream_status: response.status,
      upstream_status_text: response.statusText,
      upstream_response: result,
    };
  }

  return payload;
}

export async function POST(request: Request) {
  try {
    const data: SignupRequest = await request.json();
    const firstName = data.first_name?.trim();
    const lastName = data.last_name?.trim();
    const email = data.user_email?.trim();
    const password = data.user_password;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields", success: false },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { status: "error", message: "Please enter a valid email address", success: false },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { status: "error", message: "Password must be at least 8 characters long", success: false },
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
      const response = await fetch(`${API_BASE_URL}/auth/onboard/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          user_email: email,
          user_password: password,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json")
        ? await response.json()
        : { message: (await response.text()).slice(0, 200) };

      if (!response.ok) {
        console.error("[ONBOARD_SIGNUP] Upstream signup failed", {
          status: response.status,
          statusText: response.statusText,
          body: result,
        });

        return NextResponse.json(
          getErrorPayload(result, response, "Signup service is temporarily unavailable. Please try again later."),
          { status: response.status }
        );
      }

      const token = getOnboardingToken(result);
      if (!token) {
        console.error("[ONBOARD_SIGNUP] Upstream signup response missing token", {
          status: response.status,
          body: result,
        });

        return NextResponse.json(
          {
            status: "error",
            message: "Signup response did not include a verification token.",
            success: false,
            ...(process.env.NODE_ENV !== "production"
              ? { debug: { upstream_status: response.status, upstream_response: result } }
              : {}),
          },
          { status: 502 }
        );
      }

      const userId = result.data?.id || result.data?.user_id || null;
      const userEmail = result.data?.user_email || email;
      const nextResponse = NextResponse.json(
        {
          status: "success",
          message: result.message || "Verification code sent to your email.",
          success: true,
          data: {
            user_id: userId,
            user_email: userEmail,
          },
        },
        { status: response.status }
      );

      const cookieOptions = {
        path: "/",
        httpOnly: true,
        sameSite: "lax" as const,
        maxAge: 86400,
        secure: process.env.NODE_ENV === "production",
      };

      nextResponse.cookies.set("onboard_token", token, cookieOptions);
      nextResponse.cookies.set("onboard_email", userEmail, {
        ...cookieOptions,
        httpOnly: false,
      });

      if (userId) {
        nextResponse.cookies.set("user_id", String(userId), {
          ...cookieOptions,
          httpOnly: false,
          maxAge: 2592000,
        });
      }

      nextResponse.cookies.set("user_email", userEmail, {
        ...cookieOptions,
        httpOnly: false,
        maxAge: 2592000,
      });

      return nextResponse;
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("[ONBOARD_SIGNUP] Upstream signup timed out");
        return NextResponse.json(
          { status: "error", message: "Signup request timed out. Please try again.", success: false },
          { status: 408 }
        );
      }

      console.error("[ONBOARD_SIGNUP] Unable to reach upstream signup service", fetchError);
      return NextResponse.json(
        { status: "error", message: "Unable to connect to signup service. Please try again later.", success: false },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("[ONBOARD_SIGNUP] Unexpected error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
