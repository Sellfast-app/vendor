import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://api.swiftree.app";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    // Await the params first
    const { productId } = await params;

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

    if (!productId) {
      return NextResponse.json(
        { status: "error", message: "Product ID is required" },
        { status: 400 }
      );
    }

    console.log(`🗑️ Deleting product: ${productId}`);

    const externalUrl = `${API_BASE_URL}/api/products/${productId}`;
    console.log("External DELETE URL:", externalUrl);

    const response = await fetch(externalUrl, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("External API error:", response.status, errorText);
      
      if (response.status === 401) {
        return NextResponse.json(
          { 
            status: "error", 
            message: "Authentication failed. Please login again."
          },
          { status: 401 }
        );
      }
      
      // Try to parse the error response from external API
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(
          { 
            status: "error", 
            message: errorData.message || "Failed to delete product"
          },
          { status: response.status }
        );
      } catch {
        return NextResponse.json(
          { 
            status: "error", 
            message: "Failed to delete product"
          },
          { status: response.status }
        );
      }
    }

    const result = await response.json();
    console.log("✅ Product deleted successfully:", result);

    // Return the exact same structure as the external API
    return NextResponse.json(result);

  } catch (error) {
    console.error("Delete product API error:", error);
    return NextResponse.json(
      { 
        status: "error", 
        message: "Failed to delete product"
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> } // Changed from 'id' to 'productId'
) {
  try {
    // Await the params first - use productId to match DELETE
    const { productId } = await params;
    
    console.log('🔍 PATCH Request for product ID:', productId);

    if (!productId || productId === 'undefined') {
      return NextResponse.json(
        { status: "error", message: "Product ID is required" },
        { status: 400 }
      );
    }

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

    // Parse the form data
    const formData = await request.formData();
    
    console.log('🔍 PATCH Request Details:', {
      productId: productId,
      storeId,
      formDataKeys: Array.from(formData.keys())
    });

    // Prepare form data for external API
    const externalFormData = new FormData();

    // Add required fields
    externalFormData.append('store_id', storeId);
    
    // Get status from form data and ensure it's included
    const status = formData.get('status') as string;
    if (!status) {
      return NextResponse.json(
        { status: "error", message: "Status field is required" },
        { status: 400 }
      );
    }
    externalFormData.append('status', status);

    // Add optional fields if they exist
    const optionalFields = [
      'name', 'price', 'quantity', 'description', 
      'est_prod_days_from', 'est_prod_days_to', 'weight'
    ];

    optionalFields.forEach(field => {
      const value = formData.get(field);
      if (value !== null && value !== '') {
        externalFormData.append(field, value as string);
        console.log(`✅ Added ${field}:`, value);
      }
    });

    // Handle file uploads
    const files = formData.getAll('files');
    files.forEach((file, index) => {
      if (file instanceof File) {
        externalFormData.append('files', file);
        console.log(`✅ Added file ${index + 1}:`, file.name);
      }
    });

    // Log the final form data being sent
    console.log('📦 Final form data being sent to external API:');
    for (const [key, value] of externalFormData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File - ${value.name}`);
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    // Make PATCH request to external API
    const externalUrl = `${API_BASE_URL}/api/products/${productId}/${storeId}`;
    console.log('🔗 Calling external API:', externalUrl);

    const response = await fetch(externalUrl, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: externalFormData,
    });

    const responseText = await response.text();
    console.log('🔍 External API Response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText
    });

    if (!response.ok) {
      let errorMessage = `Failed to update product: ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = responseText || errorMessage;
      }
      
      return NextResponse.json(
        { status: "error", message: errorMessage },
        { status: response.status }
      );
    }

    let result;
    try {
      result = JSON.parse(responseText);
      console.log('✅ Product updated successfully:', result);
    } catch {
      result = { 
        status: "error", 
        message: "Invalid response format from server",
        data: null 
      };
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("❌ Error updating product:", error);
    return NextResponse.json(
      { 
        status: "error", 
        message: "Failed to update product",
        data: null
      },
      { status: 500 }
    );
  }
}