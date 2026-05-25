// app/api/products/food/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const CACHE_DURATION = 300; // 5 minutes

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<string, { data: any; timestamp: number }>();

function clearFoodCache(storeId: string) {
  const keysToDelete: string[] = [];
  cache.forEach((_, key) => {
    if (key.startsWith(`food-${storeId}`)) keysToDelete.push(key);
  });
  keysToDelete.forEach(key => cache.delete(key));
  console.log(`✅ Cleared ${keysToDelete.length} food cache entries for store ${storeId}`);
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split("=");
    acc[name] = value;
    return acc;
  }, {} as Record<string, string>);
}


export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const cookies = parseCookies(cookieHeader);
    const token = cookies.accessToken || null;
    const storeId = cookies.store_id || null;

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Authentication required" },
        { status: 401 }
      );
    }

    if (!storeId) {
      return NextResponse.json(
        { status: "error", message: "Store ID not found" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "10";
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "";
    const dir = searchParams.get("dir") || "";
    const bustCache = searchParams.get("_t");

    const cacheKey = `food-${storeId}-${page}-${pageSize}-${search}-${status}-${sort}-${dir}`;
    const shouldBypassCache = !!bustCache;

    if (!shouldBypassCache) {
      const cachedData = cache.get(cacheKey);
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION * 1000) {
        console.log('📦 Returning cached food items data');
        return NextResponse.json(cachedData.data);
      }
    }

    // Build query string
    const queryParams = new URLSearchParams({
      page,
      pageSize,
      ...(search && { search }),
      ...(status && { status }),
      ...(sort && { sort }),
      ...(dir && { dir }),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/products/food/${storeId}?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { status: "error", message: error.message || "Failed to fetch food items" },
        { status: response.status }
      );
    }

    const result = await response.json();

    if (result.status === 'success' && !shouldBypassCache) {
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      console.log('💾 Cached food items for key:', cacheKey);
    }

    return NextResponse.json(result);

  } // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (error: any) {
    console.error("Error fetching food items:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const cookies = parseCookies(cookieHeader);
    const token = cookies.accessToken || null;
    const storeId = cookies.store_id || null;

    if (!token) {
      return NextResponse.json({ status: "error", message: "Authentication required" }, { status: 401 });
    }

    if (!storeId) {
      return NextResponse.json({ status: "error", message: "Store ID not found" }, { status: 400 });
    }

    // Parse the incoming FormData
    const formData = await request.formData();

    // Build a FRESH FormData - this is the correct way to avoid boundary corruption
    const newFormData = new FormData();

    // 🔑 Add store_id FIRST
    newFormData.append("store_id", storeId);

    // Copy all fields EXCEPT store_id (we already added it)
    for (const [key, value] of formData.entries()) {
      if (key === "store_id") continue;
      
      if (value instanceof File) {
        // Append file with its original name
        newFormData.append(key, value, value.name);
      } else {
        newFormData.append(key, value);
      }
    }

    // Debug: log what we're sending
    console.log("🍔 Forwarding food POST request with fields:");
    let totalSize = 0;
    for (const [key, value] of newFormData.entries()) {
      if (value instanceof File) {
        totalSize += value.size;
        console.log(`  📁 ${key}: ${value.name} (${(value.size / 1024).toFixed(1)}KB, ${value.type})`);
      } else {
        const str = String(value);
        console.log(`  📝 ${key}: ${str.substring(0, 100)}`);
      }
    }
    console.log(`  📦 Total size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/food`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: newFormData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        console.error("❌ Non-JSON response:", textResponse.substring(0, 500));
        return NextResponse.json(
          { status: "error", message: `Upstream error: ${response.status}` },
          { status: 502 }
        );
      }

      const result = await response.json();
      console.log("🍔 Food API response:", result.status, result.message || "");

      if (!response.ok) {
        return NextResponse.json(
          { status: "error", message: result.message || "Failed to add food item" },
          { status: response.status }
        );
      }

      clearFoodCache(storeId);
      return NextResponse.json(result, { status: response.status });

    }// eslint-disable-next-line @typescript-eslint/no-explicit-any 
    catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === "AbortError") {
        console.error("❌ Request timed out after 120s");
        return NextResponse.json(
          { status: "error", message: "Request timed out. Please try again with smaller images." },
          { status: 408 }
        );
      }

      console.error("❌ API connection error:", fetchError.message);
      return NextResponse.json(
        { status: "error", message: "Unable to connect to food service." },
        { status: 503 }
      );
    }

  } // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (error: any) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}