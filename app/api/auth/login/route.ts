// app/api/auth/login/route.ts
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const EXTERNAL_API_TIMEOUT = 15000; // Increased to 15 seconds

// Cache for rate limiting (in-memory, for production use Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export async function POST(request: Request) {
  const startTime = Date.now();
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    const { email, password } = await request.json();

    console.log(`[LOGIN] Attempt for: ${email}, IP: ${clientIP}`);

    // Rate limiting check
    const now = Date.now();
    const userAttempts = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
    
    if (now - userAttempts.lastAttempt < 2000) { // 2 second cooldown
      return NextResponse.json(
        { status: "error", message: "Too many attempts. Please wait a moment.", success: false },
        { status: 429 }
      );
    }

    // Basic validation
    if (!email?.trim() || !password) {
      return NextResponse.json(
        { status: "error", message: "Email and password are required", success: false },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { status: "error", message: "Please enter a valid email address", success: false },
        { status: 400 }
      );
    }

    // Prepare fetch with better timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EXTERNAL_API_TIMEOUT);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Swiftree-Frontend/1.0",
        },
        body: JSON.stringify({ 
          email: email.trim(), 
          password 
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      console.log(`[LOGIN] External API response - Status: ${response.status}, Time: ${responseTime}ms`);

      const result = await response.json();

      // Handle specific API response formats
      if (response.status === 500 && result.status === 'fail') {
        loginAttempts.set(email, { count: userAttempts.count + 1, lastAttempt: now });
        return NextResponse.json(
          { 
            status: "error", 
            message: result.message || "Invalid email or password", 
            success: false 
          },
          { status: 401 }
        );
      }

      if (!response.ok) {
        loginAttempts.set(email, { count: userAttempts.count + 1, lastAttempt: now });
        return NextResponse.json(
          { 
            status: "error", 
            message: result.message || `Login failed (${response.status})`, 
            success: false 
          },
          { status: response.status }
        );
      }

      // Successful login
      if (!result.data?.token) {
        console.error("[LOGIN] Missing token in response");
        return NextResponse.json(
          { status: "error", message: "Invalid authentication response", success: false },
          { status: 502 }
        );
      }

      // Extract store info
      let storeName = email.split('@')[0] + "'s Store";
      let storeId = null;
      let storeUrl = null;
      
      if (result.data.stores?.[0]) {
        const firstStore = result.data.stores[0];
        storeName = firstStore.name || firstStore.store_name || firstStore.business_name || storeName;
        storeId = firstStore.id || firstStore.store_id || null;
        storeUrl = firstStore.url || null;
      }

      // Create successful response
      const nextResponse = NextResponse.json(
        {
          status: "success",
          message: result.message || "Login successful",
          success: true,
          data: { store_name: storeName, store_id: storeId, store_url: storeUrl }
        },
        { status: 200 }
      );

      // Set cookies
      const cookieOptions = {
        path: "/",
        httpOnly: true,
        sameSite: "lax" as const,
        maxAge: 86400,
        secure: process.env.NODE_ENV === "production",
      };

      nextResponse.cookies.set("accessToken", result.data.token, cookieOptions);
      nextResponse.cookies.set("store_name", storeName, { ...cookieOptions, httpOnly: false });
      
      if (storeId) {
        nextResponse.cookies.set("store_id", storeId, { ...cookieOptions, httpOnly: false });
      }

      if (storeUrl) {
        nextResponse.cookies.set("store_url", storeUrl, { ...cookieOptions, httpOnly: false });
      }

      // Clear login attempts on success
      loginAttempts.delete(email);
      
      console.log(`[LOGIN] Success for: ${email}, Total time: ${Date.now() - startTime}ms`);
      return nextResponse;

    }  // eslint-disable-next-line @typescript-eslint/no-explicit-any 
    catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === "AbortError") {
        console.error(`[LOGIN] Timeout for: ${email}, IP: ${clientIP}`);
        return NextResponse.json(
          { 
            status: "error", 
            message: "Authentication service is taking too long to respond. Please try again.", 
            success: false 
          },
          { status: 408 }
        );
      }
      
      console.error(`[LOGIN] Connection error for: ${email}`, fetchError);
      return NextResponse.json(
        { 
          status: "error", 
          message: "Unable to connect to authentication service. Please check your connection.", 
          success: false 
        },
        { status: 503 }
      );
    }

  }   // eslint-disable-next-line @typescript-eslint/no-explicit-any 
  catch (error: any) {
    console.error(`[LOGIN] Unexpected error:`, error);
    return NextResponse.json(
      { status: "error", message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}