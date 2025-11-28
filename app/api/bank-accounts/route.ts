import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = "https://api.swiftree.app";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Get store ID from cookies
    const storeId = cookieStore.get('store_id')?.value;
    
    console.log('🔍 Bank Accounts API Debug - Store ID from cookies:', storeId);
    
    if (!storeId) {
      console.error('❌ Bank Accounts API Error: No store ID found in cookies');
      return NextResponse.json(
        { 
          status: "error", 
          message: "Store ID not found. Please login again.",
          data: null 
        },
        { status: 401 }
      );
    }

    // Get access token from cookies
    const accessToken = cookieStore.get('accessToken')?.value;
    
    if (!accessToken) {
      console.error('❌ Bank Accounts API Error: No access token found');
      return NextResponse.json(
        { 
          status: "error", 
          message: "Authentication required. Please login again.",
          data: null 
        },
        { status: 401 }
      );
    }

    console.log(`🏦 Fetching bank account details for store: ${storeId}`);

    // Fetch bank account details from backend
    const response = await fetch(
      `${API_BASE_URL}/api/payments/${storeId}/bank-details`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    const responseText = await response.text();
    console.log('🔍 Bank Accounts API - Backend response status:', response.status);
    console.log('🔍 Bank Accounts API - Backend response body:', responseText);

    if (!response.ok) {
      console.error('❌ Bank accounts API error:', response.status, responseText);
      
      let errorMessage = `Failed to fetch bank accounts: ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = responseText || errorMessage;
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

    let result;
    try {
      result = JSON.parse(responseText);
      console.log('✅ Successfully fetched bank account details:', result);
      console.log('📊 FULL RESPONSE STRUCTURE:', JSON.stringify(result, null, 2));
      
      // Log the data structure to help with mapping
      if (result.data) {
        console.log('📊 Bank accounts data structure:', JSON.stringify(result.data, null, 2));
      }
      
    } catch {
      result = { 
        status: "success", 
        message: "Bank accounts fetched successfully",
        data: responseText 
      };
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("❌ Error fetching bank accounts:", error);
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