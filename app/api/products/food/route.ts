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