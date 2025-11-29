import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://api.swiftree.app";

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

    // Map frontend field names to API field names
    const fieldMapping: Record<string, string> = {
      "total-sales": "product_name,sku,stock,sales,pending_dispatch",
      "total-products": "product_name,sku,stock,product_status",
      "total-orders": "product_name,sku,stock,sales",
      "total-revenue": "product_name,sku,sales,stock",
      "cancelled-orders": "product_name,sku,stock,product_status",
      "pending-orders": "product_name,sku,stock,pending_dispatch",
      "completed-orders": "product_name,sku,stock,sales",
      "average-order-value": "product_name,sku,sales,stock",
      "Sales Count vs Revenue Growth": "product_name,sku,sales,stock",
      "Best Selling Products": "product_name,sku,sales,stock",
      "Recent Orders": "product_name,sku,stock,sales"
    };

    // Determine columns based on selected fields
    let columns = "product_name,sku,stock,sales"; // Default columns
    
    if (fields) {
      const selectedFields = fields.split(",");
      const apiFields = selectedFields.map(field => fieldMapping[field]).filter(Boolean);
      
      if (apiFields.length > 0) {
        // Combine all unique columns
        const allColumns = apiFields.join(',').split(',');
        columns = [...new Set(allColumns)].join(',');
      }
    }

    console.log(`📊 Exporting products for store: ${storeId}`);
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

    const externalUrl = `${API_BASE_URL}/api/products/store/${storeId}/export?${queryParams}`;
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
          message: "Failed to export products data"
        },
        { status: response.status }
      );
    }

    // Get the CSV data as blob
    const blob = await response.blob();
    
    // Get filename from response headers or generate one
    const contentDisposition = response.headers.get('content-disposition');
    let filename = `products_export_${startDate}_to_${endDate}.csv`;
    
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
    console.error("Export products API error:", error);
    return NextResponse.json(
      { 
        status: "error", 
        message: "Failed to export products data"
      },
      { status: 500 }
    );
  }
}