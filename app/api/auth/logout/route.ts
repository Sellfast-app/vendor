// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NODE_ENV === "development" ? "http://localhost:44332" : "https://api.swiftree.app";

interface LogoutResponse {
  status: string;
  message: string;
}

interface ApiError {
  status: string;
  message: string;
}

export async function POST(request: Request) {
  try {
    const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");

    // Mock response for development
    if (process.env.NODE_ENV === "development") {
      console.log("Using mock response for /auth/logout");
      const response = NextResponse.json(
        { status: "success", message: "Logged out successfully" },
        { status: 200 }
      );
      response.cookies.delete("accessToken");
      return response;
    }

    // Call external API to invalidate session
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    });

    const result: LogoutResponse | ApiError = await response.json();
    console.log("External API response:", { status: response.status, result });

    if (!response.ok) {
      console.log("External API error:", result);
      return NextResponse.json(
        { status: "error", message: (result as ApiError).message || "Failed to log out" },
        { status: response.status }
      );
    }

    // Clear accessToken cookie
    const nextResponse = NextResponse.json(
      { status: "success", message: "Logged out successfully" },
      { status: 200 }
    );
    nextResponse.cookies.delete("accessToken");

    return nextResponse;
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
    return NextResponse.json({ status: "error", message: errorMessage }, { status: 500 });
  }
}