import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://api.swiftree.app";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> } // Add Promise wrapper
) {
  try {
    // Await the params first
    const { reference } = await params;

    console.log('🔍 Verifying payment for reference:', reference);

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
      console.error('❌ No access token found');
      return NextResponse.json(
        { status: "error", message: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify payment with backend
    const externalUrl = `${API_BASE_URL}/api/payments/verify/${reference}`;
    console.log('🔍 Calling external URL:', externalUrl);

    const response = await fetch(externalUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const responseText = await response.text();
    console.log('🔍 Backend response status:', response.status);
    console.log('🔍 Backend response body:', responseText);

    if (!response.ok) {
      console.error('❌ Payment verification error:', response.status, responseText);
      
      let errorMessage = `Failed to verify payment: ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = responseText || errorMessage;
      }
      
      return NextResponse.json(
        { status: "error", message: errorMessage, data: null },
        { status: response.status }
      );
    }

    let result;
    try {
      result = JSON.parse(responseText);
      console.log('✅ Payment verification successful:', {
        reference: result.data?.reference,
        verified: result.data?.verified,
        amount: result.data?.amount,
        transaction_status: result.data?.transaction_status
      });
    } catch {
      result = { 
        status: "error", 
        message: "Invalid response format",
        data: null 
      };
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error("❌ Payment verification API error:", error);
    return NextResponse.json(
      { 
        status: "error", 
        message: "Failed to verify payment",
        data: null
      },
      { status: 500 }
    );
  }
}