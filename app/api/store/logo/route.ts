import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = "https://api.swiftree.app";
const INTERNAL_SECRET = process.env.INTERNAL_SECRET;

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Get store ID from cookies
    const storeId = cookieStore.get('store_id')?.value;
    
    console.log('🔍 Logo Upload - Store ID from cookies:', storeId);
    console.log('🔍 Logo Upload - INTERNAL_SECRET exists:', !!INTERNAL_SECRET);
    
    if (!storeId) {
      console.error('❌ Logo Upload Error: No store ID found in cookies');
      return NextResponse.json(
        { error: 'Store ID not found. Please login again.' },
        { status: 401 }
      );
    }

    if (!INTERNAL_SECRET) {
      console.error('❌ Logo Upload Error: INTERNAL_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
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
      size: logoFile.size,
      sizeInMB: (logoFile.size / (1024 * 1024)).toFixed(2) + 'MB'
    });

    // Create form data for backend API
    const backendFormData = new FormData();
    backendFormData.append('logo', logoFile);

    // Debug: Log the request details
    console.log('🔍 Logo Upload - Request details:', {
      url: `${API_BASE_URL}/api/stores/${storeId}/logo`,
      hasInternalSecret: !!INTERNAL_SECRET,
      storeId: storeId
    });

    // Upload to backend API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(`${API_BASE_URL}/api/stores/${storeId}/logo`, {
        method: 'POST',
        headers: {
          'X-Internal-Secret': INTERNAL_SECRET,
        },
        body: backendFormData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      console.log('🔍 Logo Upload - Backend response status:', response.status);
      console.log('🔍 Logo Upload - Backend response body:', responseText);

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
        
        // Special handling for 401 - likely authentication issue
        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please check server configuration.';
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
      
    } catch (fetchError: any) {
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

// Set config to handle larger file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};