// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://api.swiftree.app";

const CACHE_DURATION = 300;

const cache = new Map();

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const cookieHeader = request.headers.get("cookie");
    let token = null;

    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies.accessToken || null;
    }

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Authentication required" },
        { status: 401 }
      );
    }

    // Get store_id from cookies
    let storeId = null;
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      storeId = cookies.store_id || null;
    }

    if (!storeId) {
      return NextResponse.json(
        { status: "error", message: "Store ID not found" },
        { status: 400 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "10";
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "";
    const dir = searchParams.get("dir") || "";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const search = searchParams.get("search") || "";

    // Create cache key based on all parameters
    const cacheKey = `${storeId}-${page}-${pageSize}-${status}-${sort}-${dir}-${minPrice}-${maxPrice}-${search}`;

    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION * 1000) {
      console.log('Returning cached products data');
      return NextResponse.json(cachedData.data);
    }

    // Build query string
    const queryParams = new URLSearchParams({
      page,
      pageSize,
      ...(status && { status }),
      ...(sort && { sort }),
      ...(dir && { dir }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
      ...(search && { search }),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/products/store/${storeId}?${queryParams}`,
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
        { status: "error", message: error.message || "Failed to fetch products" },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Cache the successful response
    if (result.status === 'success') {
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      console.log('Cached products data for key:', cacheKey);
    }

    return NextResponse.json(result);

  } // eslint-disable-next-line @typescript-eslint/no-explicit-any  
  catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get token from cookies
    const cookieHeader = request.headers.get("cookie");
    let token = null;

    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies.accessToken || null;
    }

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Authentication required" },
        { status: 401 }
      );
    }

    // Get form data from request
    const formData = await request.formData();

    // Prepare request to external API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { status: "error", message: result.message || "Failed to add product" },
          { status: response.status }
        );
      }

      // Clear cache when a new product is added
      cache.clear();
      console.log('Products cache cleared after adding new product');

      return NextResponse.json(result, { status: response.status });

    } // eslint-disable-next-line @typescript-eslint/no-explicit-any  
    catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === "AbortError") {
        return NextResponse.json(
          { status: "error", message: "Request timeout. Please try again." },
          { status: 408 }
        );
      }

      console.error("API connection error:", fetchError);
      return NextResponse.json(
        { status: "error", message: "Unable to connect to product service. Please try again later." },
        { status: 503 }
      );
    }

  } // eslint-disable-next-line @typescript-eslint/no-explicit-any 
   catch (error: any) {
    console.error("Unexpected error in products API:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Add a DELETE method to handle product deletion and cache clearing
export async function DELETE(request: Request) {
  try {
    // Get token from cookies
    const cookieHeader = request.headers.get("cookie");
    let token = null;

    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies.accessToken || null;
    }

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Authentication required" },
        { status: 401 }
      );
    }

    // Clear cache when products are deleted
    cache.clear();
    console.log('Products cache cleared after deletion');

    return NextResponse.json(
      { status: "success", message: "Cache cleared" },
      { status: 200 }
    );

  } // eslint-disable-next-line @typescript-eslint/no-explicit-any  
  catch (error: any) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}