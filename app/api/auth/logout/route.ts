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

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store'
};

export async function POST(request: Request) {
  try {
    const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");

    // Mock response for development
    if (process.env.NODE_ENV === "development") {
      console.log("Using mock response for /auth/logout");
      const response = NextResponse.json(
        { status: "success", message: "Logged out successfully" },
        { 
          status: 200,
          headers: noCacheHeaders
        }
      );
      
      // Clear both cookies
      response.cookies.delete("accessToken");
      response.cookies.delete("store_name");
      
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

    console.log("External API response status:", response.status);
    console.log("External API response content-type:", response.headers.get("content-type"));

    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!isJson) {
      console.log("External API returned non-JSON response, likely HTML error page");
      // If it's not JSON, we'll still clear cookies and consider logout successful
      const nextResponse = NextResponse.json(
        { status: "success", message: "Logged out successfully (session cleared locally)" },
        { 
          status: 200,
          headers: noCacheHeaders
        }
      );
      
      nextResponse.cookies.delete("accessToken");
      nextResponse.cookies.delete("store_name");
      
      return nextResponse;
    }

    let result: LogoutResponse | ApiError;
    try {
      result = await response.json();
      console.log("External API response data:", result);
    } catch (jsonError) {
      console.log("Failed to parse JSON response:", jsonError);
      // If JSON parsing fails, still clear cookies locally
      const nextResponse = NextResponse.json(
        { status: "success", message: "Logged out successfully (session cleared locally)" },
        { 
          status: 200,
          headers: noCacheHeaders
        }
      );
      
      nextResponse.cookies.delete("accessToken");
      nextResponse.cookies.delete("store_name");
      
      return nextResponse;
    }

    if (!response.ok) {
      console.log("External API error:", result);
      // Even if the API call fails, we should clear local cookies
      const nextResponse = NextResponse.json(
        { status: "success", message: "Logged out successfully (session cleared locally)" },
        { 
          status: 200,
          headers: noCacheHeaders
        }
      );
      
      nextResponse.cookies.delete("accessToken");
      nextResponse.cookies.delete("store_name");
      
      return nextResponse;
    }

    // Clear both accessToken and store_name cookies
    const nextResponse = NextResponse.json(
      { status: "success", message: "Logged out successfully" },
      { 
        status: 200,
        headers: noCacheHeaders
      }
    );
    
    nextResponse.cookies.delete("accessToken");
    nextResponse.cookies.delete("store_name");

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
    return NextResponse.json(
      { status: "error", message: errorMessage }, 
      { 
        status: 500,
        headers: noCacheHeaders
      }
    );
  }
}