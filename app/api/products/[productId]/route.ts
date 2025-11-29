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