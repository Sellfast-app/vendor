import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");
const EXTERNAL_API_TIMEOUT = 20000;

interface BrandColor {
  primary?: string;
  secondary?: string;
  accent?: string;
}

interface BusinessDetails {
  store_name: string;
  type: string;
  description: string;
  metadata?: {
    brand_color?: BrandColor;
  };
}

interface OnboardCreateRequest {
  business_details: BusinessDetails;
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function extractStore(result: Record<string, unknown>) {
  const data = result.data as Record<string, unknown> | undefined;
  const defaultStore = data?.defaultStore as Record<string, unknown> | undefined;
  const store = data?.store as Record<string, unknown> | undefined;
  const storeDetails = data?.storeDetails as Record<string, unknown> | undefined;
  const source = defaultStore || store || storeDetails || data || {};

  return {
    id: asString(source.store_id) || asString(source.id),
    name: asString(source.store_name) || asString(source.name),
    url: asString(source.store_url) || asString(source.url),
    qrCode: asString(source.qrCode) || asString(source.qr_code),
  };
}

function getApiMessage(result: Record<string, unknown>, fallback: string) {
  const message = typeof result.message === "string" ? result.message : "";
  if (!message || /<[^>]+>/.test(message)) {
    return fallback;
  }
  return message;
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("onboard_token")?.value;
    const userEmail = request.cookies.get("user_email")?.value || request.cookies.get("onboard_email")?.value || null;
    const userId = request.cookies.get("user_id")?.value || null;
    const data: OnboardCreateRequest = await request.json();

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Onboarding session expired. Please start signup again.", success: false },
        { status: 401 }
      );
    }

    if (
      !data.business_details?.store_name?.trim() ||
      !data.business_details?.type ||
      !data.business_details?.description?.trim()
    ) {
      return NextResponse.json(
        { status: "error", message: "Missing required business details", success: false },
        { status: 400 }
      );
    }

    if (!API_BASE_URL) {
      return NextResponse.json(
        { status: "error", message: "Onboarding service is not configured.", success: false },
        { status: 500 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EXTERNAL_API_TIMEOUT);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/onboard/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json")
        ? await response.json()
        : { message: (await response.text()).slice(0, 200) };

      if (!response.ok) {
        return NextResponse.json(
          {
            status: "error",
            message: getApiMessage(result, "Onboarding service is temporarily unavailable. Please try again later."),
            success: false,
          },
          { status: response.status }
        );
      }

      const store = extractStore(result);
      const responseData = result.data as Record<string, unknown> | undefined;
      const storeName = String(store.name || data.business_details.store_name);
      const qrCode = typeof store.qrCode === "string" && store.qrCode
        ? (store.qrCode.startsWith("http") ? store.qrCode : `${API_BASE_URL}${store.qrCode}`)
        : null;
      const resolvedUserId = asString(responseData?.id) || userId;
      const resolvedUserEmail = asString(responseData?.user_email) || userEmail;

      const nextResponse = NextResponse.json(
        {
          status: "success",
          message: result.message || "Business profile created successfully.",
          success: true,
          data: {
            token,
            user_id: resolvedUserId,
            user_email: resolvedUserEmail,
            store_name: storeName,
            store_id: store.id,
            store_url: store.url,
            qrCode,
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

      nextResponse.cookies.set("accessToken", token, cookieOptions);
      nextResponse.cookies.set("store_name", storeName, {
        ...cookieOptions,
        httpOnly: false,
        maxAge: 2592000,
      });

      if (store.id) {
        nextResponse.cookies.set("store_id", String(store.id), {
          ...cookieOptions,
          httpOnly: false,
          maxAge: 2592000,
        });
      }

      if (store.url) {
        nextResponse.cookies.set("store_url", String(store.url), {
          ...cookieOptions,
          httpOnly: false,
          maxAge: 2592000,
        });
      }

      if (resolvedUserId) {
        nextResponse.cookies.set("user_id", resolvedUserId, {
          ...cookieOptions,
          httpOnly: false,
          maxAge: 2592000,
        });
      }

      if (resolvedUserEmail) {
        nextResponse.cookies.set("user_email", resolvedUserEmail, {
          ...cookieOptions,
          httpOnly: false,
          maxAge: 2592000,
        });
      }

      nextResponse.cookies.delete("onboard_token");
      nextResponse.cookies.delete("onboard_email");

      return nextResponse;
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json(
          { status: "error", message: "Business profile request timed out. Please try again.", success: false },
          { status: 408 }
        );
      }

      return NextResponse.json(
        { status: "error", message: "Unable to connect to onboarding service. Please try again later.", success: false },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("[ONBOARD_CREATE] Unexpected error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
