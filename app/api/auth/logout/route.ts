// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store'
};

function createLogoutResponse(message: string) {
  const response = NextResponse.json(
    { status: "success", message },
    {
      status: 200,
      headers: noCacheHeaders,
    }
  );

  response.cookies.delete("accessToken");
  response.cookies.delete("store_name");

  return response;
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      cookieStore.get("accessToken")?.value;

    // Call external API to invalidate session
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    });

    console.log("External API response status:", response.status);
    console.log("External API response content-type:", response.headers.get("content-type"));

    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!isJson) {
      console.log("External API returned non-JSON response, likely HTML error page");
      return createLogoutResponse(
        "Logged out successfully (session cleared locally)"
      );
    }

    try {
      await response.json();
    } catch (jsonError) {
      console.log("Failed to parse JSON response:", jsonError);
      return createLogoutResponse(
        "Logged out successfully (session cleared locally)"
      );
    }

    if (!response.ok) {
      console.log("External API logout failed with status:", response.status);
      return createLogoutResponse(
        "Logged out successfully (session cleared locally)"
      );
    }

    return createLogoutResponse("Logged out successfully");
  } catch (error) {
    // Proper error handling with type checking
    let errorMessage = "Internal server error";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error && typeof error === "object" && "message" in error) {
      errorMessage = String(error.message);
    }
    
    console.error("Logout API error:", errorMessage);
    return createLogoutResponse(
      `Logged out locally because the authentication service failed: ${errorMessage}`
    );
  }
}
