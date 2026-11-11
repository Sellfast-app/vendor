import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const INTERNAL_SECRET = process.env.INTERNAL_SECRET;

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const storeId = cookieStore.get('store_id')?.value;
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!storeId || !accessToken) {
      return NextResponse.json({ error: 'Authentication required. Please login again.' }, { status: 401 });
    }
    if (!API_BASE_URL || !INTERNAL_SECRET) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('footer_image');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No footer image provided' }, { status: 400 });
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return NextResponse.json({ error: 'File must be JPEG, PNG, or WebP' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be 10MB or smaller' }, { status: 400 });
    }

    const backendFormData = new FormData();
    backendFormData.append('footer_image', file);
    const response = await fetch(`${API_BASE_URL}/api/stores/${storeId}/footer-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Internal-Secret': INTERNAL_SECRET,
      },
      body: backendFormData,
      signal: AbortSignal.timeout(30_000),
    });

    const body = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json(
        { error: body?.message || body?.error || 'Failed to upload footer image' },
        { status: response.status },
      );
    }
    return NextResponse.json(body);
  } catch (error) {
    console.error('Footer image upload failed:', error);
    return NextResponse.json({ error: 'Unable to upload footer image' }, { status: 500 });
  }
}
