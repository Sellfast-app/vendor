import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL =  "https://api.swiftree.app";
const INTERNAL_SECRET = process.env.INTERNAL_SECRET;

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Get store ID from cookies
    const storeId = cookieStore.get('store_id')?.value;
    
    console.log('🔍 Banner Upload - Store ID from cookies:', storeId);
    
    if (!storeId) {
      console.error('❌ Banner Upload Error: No store ID found in cookies');
      return NextResponse.json(
        { error: 'Store ID not found. Please login again.' },
        { status: 401 }
      );
    }

    // Get access token from cookies for authorization
    const accessToken = cookieStore.get('accessToken')?.value;
    
    if (!accessToken) {
      console.error('❌ Banner Upload Error: No access token found');
      return NextResponse.json(
        { error: 'Authentication required. Please login again.' },
        { status: 401 }
      );
    }

    if (!INTERNAL_SECRET) {
      console.error('❌ Banner Upload Error: INTERNAL_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const bannerFile = formData.get('banner') as File;

    if (!bannerFile) {
      return NextResponse.json(
        { error: 'No banner file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(bannerFile.type)) {
      return NextResponse.json(
        { error: 'File must be an image (JPEG, PNG, WebP)' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (bannerFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    console.log('📤 Uploading banner file:', {
      name: bannerFile.name,
      type: bannerFile.type,
      size: bannerFile.size
    });

    // Create form data for backend API
    const backendFormData = new FormData();
    backendFormData.append('banner', bannerFile);

    // Upload to backend API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(`${API_BASE_URL}/api/stores/${storeId}/banner`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Internal-Secret': INTERNAL_SECRET,
        },
        body: backendFormData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      console.log('🔍 Banner Upload - Backend response status:', response.status);

      if (!response.ok) {
        console.error('❌ Backend banner upload error:', {
          status: response.status,
          statusText: response.statusText,
          error: responseText
        });
        
        let errorMessage = `Failed to upload banner: ${response.status} ${response.statusText}`;
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
        data = { success: true, message: 'Banner uploaded successfully' };
      }
      
      console.log('✅ Banner uploaded successfully:', data);
      
      return NextResponse.json(data, { status: 200 });
      
    }// eslint-disable-next-line @typescript-eslint/no-explicit-any 
     catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('❌ Banner Upload Timeout: Request took too long');
        return NextResponse.json(
          { error: 'Upload timeout. Please try again with a smaller file.' },
          { status: 408 }
        );
      }
      
      throw fetchError;
    }
    
  } catch (error) {
    console.error('❌ Banner Upload Catch Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}