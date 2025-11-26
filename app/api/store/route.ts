import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = "https://api.swiftree.app";

const CACHE_DURATION = 600; // 10 minutes cache for store details
const cache = new Map();
const INTERNAL_SECRET = process.env.INTERNAL_SECRET;

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    
    // Get store ID from cookies
    const storeId = cookieStore.get('store_id')?.value;
    
    console.log('🔍 API Debug - Store ID from cookies:', storeId);
    console.log('🔍 API Debug - All cookies:', {
      store_id: storeId,
      accessToken: !!cookieStore.get('accessToken')?.value,
      store_name: cookieStore.get('store_name')?.value
    });
    
    if (!storeId) {
      console.error('❌ API Error: No store ID found in cookies');
      return NextResponse.json(
        { error: 'Store ID not found. Please login again.' },
        { status: 401 }
      );
    }

    // Get access token from cookies
    const accessToken = cookieStore.get('accessToken')?.value;
    
    if (!accessToken) {
      console.error('❌ API Error: No access token found');
      return NextResponse.json(
        { error: 'Authentication required. Please login again.' },
        { status: 401 }
      );
    }

    console.log('🔍 API Debug - Request body:', JSON.stringify(body, null, 2));

    // Forward the request to your backend API
    const response = await fetch(`${API_BASE_URL}/api/stores/${storeId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    console.log('🔍 API Debug - Backend response status:', response.status);
    console.log('🔍 API Debug - Backend response body:', responseText);

    if (!response.ok) {
      console.error('❌ Backend API error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseText
      });
      
      let errorMessage = `Failed to update store: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use the text as is
        errorMessage = responseText || errorMessage;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { success: true, message: 'Store updated successfully' };
    }
    
    console.log('✅ API Success - Store updated:', data);
    
    return NextResponse.json(data, { status: 200 });
    
  } catch (error) {
    console.error('❌ API Catch Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Get store ID from cookies
    const storeId = cookieStore.get('store_id')?.value;
    
    console.log('🔍 API Debug - Store ID from cookies:', storeId);
    console.log('🔍 API Debug - All cookies:', {
      store_id: storeId,
      accessToken: !!cookieStore.get('accessToken')?.value,
      store_name: cookieStore.get('store_name')?.value
    });
    
    if (!storeId) {
      console.error('❌ API Error: No store ID found in cookies');
      return NextResponse.json(
        { 
          status: "error", 
          message: "Store ID not found. Please login again.",
          data: null 
        },
        { status: 401 }
      );
    }

    // Create cache key
    const cacheKey = `store-${storeId}`;

    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION * 1000) {
      console.log('✅ Returning cached store details');
      return NextResponse.json(cachedData.data);
    }

    console.log(`🏪 Fetching store details for: ${storeId}`);

    // No authentication required for this endpoint
    const response = await fetch(
      `${API_BASE_URL}/api/stores/${storeId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Store details API error:', response.status, errorText);
      
      let errorMessage = `Failed to fetch store details: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      return NextResponse.json(
        { 
          status: "error", 
          message: errorMessage,
          data: null 
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('✅ Successfully fetched store details:', {
      storeName: result.data?.storeDetails?.store_name,
      businessType: result.data?.storeDetails?.business_type,
      description: result.data?.storeDetails?.store_description
    });

    // Cache the successful response
    if (result.status === 'success') {
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      console.log('✅ Cached store details for key:', cacheKey);
    }

    return NextResponse.json(result);

  }    // eslint-disable-next-line @typescript-eslint/no-explicit-any
   catch (error: any) {
    console.error("❌ Error fetching store details:", error);
    return NextResponse.json(
      { 
        status: "error", 
        message: "Internal server error",
        data: null 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Get store ID from cookies
    const storeId = cookieStore.get('store_id')?.value;
    
    console.log('🔍 Logo Upload - Store ID from cookies:', storeId);
    
    if (!storeId) {
      console.error('❌ Logo Upload Error: No store ID found in cookies');
      return NextResponse.json(
        { error: 'Store ID not found. Please login again.' },
        { status: 401 }
      );
    }

    // Get access token from cookies - THIS WAS MISSING
    const accessToken = cookieStore.get('accessToken')?.value;
    
    if (!accessToken) {
      console.error('❌ Logo Upload Error: No access token found');
      return NextResponse.json(
        { error: 'Authentication required. Please login again.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const logoFile = formData.get('logo') as File;

    if (!logoFile) {
      return NextResponse.json(
        { error: 'No logo file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!logoFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (logoFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    console.log('📤 Uploading logo file:', {
      name: logoFile.name,
      type: logoFile.type,
      size: logoFile.size
    });

    // Create form data for backend API
    const backendFormData = new FormData();
    backendFormData.append('logo', logoFile);

    // Upload to backend API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${API_BASE_URL}/api/stores/${storeId}/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`, // ADD THIS
          // Only include X-Internal-Secret if your backend actually requires it
          ...(INTERNAL_SECRET ? { 'X-Internal-Secret': INTERNAL_SECRET } : {}),
        },
        body: backendFormData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      console.log('🔍 Logo Upload - Backend response status:', response.status);

      if (!response.ok) {
        console.error('❌ Backend logo upload error:', {
          status: response.status,
          statusText: response.statusText,
          error: responseText
        });
        
        let errorMessage = `Failed to upload logo: ${response.status} ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        
        return NextResponse.json(
          { error: errorMessage },
          { status: response.status }
        );
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { success: true, message: 'Logo uploaded successfully' };
      }
      
      console.log('✅ Logo uploaded successfully:', data);
      
      return NextResponse.json(data, { status: 200 });
      
    } // eslint-disable-next-line @typescript-eslint/no-explicit-any 
    catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('❌ Logo Upload Timeout: Request took too long');
        return NextResponse.json(
          { error: 'Upload timeout. Please try again with a smaller file.' },
          { status: 408 }
        );
      }
      
      throw fetchError;
    }
    
  } catch (error) {
    console.error('❌ Logo Upload Catch Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Clear cache when needed
export async function DELETE() {
  try {
    cache.clear();
    console.log('✅ Store cache cleared');
    return NextResponse.json(
      { status: "success", message: "Store cache cleared" },
      { status: 200 }
    );
  }    // eslint-disable-next-line @typescript-eslint/no-explicit-any 
  catch (error: any) {
    console.error("❌ Error clearing store cache:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}