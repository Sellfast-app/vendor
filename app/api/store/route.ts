import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = "https://api.swiftree.app";

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