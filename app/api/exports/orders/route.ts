import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    // Get token and store_id from cookies
    const cookieHeader = request.headers.get("cookie");
    let token = null;
    let storeId = null;

    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      
      token = cookies.accessToken || null;
      storeId = cookies.store_id || null;
    }

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Authentication required" },
        { status: 401 }
      );
    }

    if (!storeId) {
      return NextResponse.json(
        { status: "error", message: "Store ID not found" },
        { status: 400 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const fields = searchParams.get("fields");

    // Validate required parameters
    if (!startDate || !endDate) {
      return NextResponse.json(
        { status: "error", message: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    // Default columns for orders
    const columns = "order_items,price,quantity,order_summary";

    console.log(`📊 Exporting orders for store: ${storeId}`);
    console.log(`📊 Date range: ${startDate} to ${endDate}`);
    console.log(`📊 Columns: ${columns}`);
    console.log(`📊 Format: ${format}`);

    // Build external API URL
    const queryParams = new URLSearchParams({
      columns,
      start: startDate,
      end: endDate,
      format: format.toLowerCase()
    });

    const externalUrl = `${API_BASE_URL}/api/orders/store/${storeId}/export?${queryParams}`;
    console.log("External export URL:", externalUrl);

    const response = await fetch(externalUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("External export API error:", response.status, errorText);
      
      return NextResponse.json(
        { 
          status: "error", 
          message: "Failed to export orders data"
        },
        { status: response.status }
      );
    }

    // Get the CSV data as blob
    const blob = await response.blob();
    
    // Get filename from response headers or generate one
    const contentDisposition = response.headers.get('content-disposition');
    let filename = `orders_export_${startDate}_to_${endDate}.csv`;
    
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match) {
        filename = match[1];
      }
    }

    // Return the file download
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error("Export orders API error:", error);
    return NextResponse.json(
      { 
        status: "error", 
        message: "Failed to export orders data"
      },
      { status: 500 }
    );
  }
}