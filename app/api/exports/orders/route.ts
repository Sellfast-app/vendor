import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("accessToken")?.value;
    const storeId = request.cookies.get("store_id")?.value;

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

    const { searchParams } = request.nextUrl;
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

    const supportedFormats = new Set(["csv", "pdf", "excel", "xlsx"]);
    if (!supportedFormats.has(format.toLowerCase())) {
      return NextResponse.json({ status: "error", message: "Choose CSV, Excel, or PDF." }, { status: 400 });
    }
    const queryParams = new URLSearchParams({
      columns: fields || "order_number,order_date,order_status,payment_status,payment_method,delivery_method,delivery_fee,order_items,quantity,price,customer_name,customer_email,customer_phone,customer_address,order_notes",
      start: startDate,
      end: endDate,
      format: format.toLowerCase()
    });

    const externalUrl = `${API_BASE_URL}/api/orders/store/${storeId}/export?${queryParams}`;
    const response = await fetch(externalUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      const contentType = response.headers.get("content-type") || "";
      const parsed = contentType.includes("application/json") ? (() => { try { return JSON.parse(errorText); } catch { return null; } })() : null;
      return NextResponse.json(
        { 
          status: "error", 
          message: parsed?.message || "Failed to export orders data"
        },
        { status: response.status }
      );
    }

    const headers = new Headers({ "Cache-Control": "no-store" });
    const contentType = response.headers.get("content-type");
    const contentDisposition = response.headers.get("content-disposition");
    if (contentType) headers.set("Content-Type", contentType);
    if (contentDisposition) headers.set("Content-Disposition", contentDisposition);
    return new NextResponse(await response.arrayBuffer(), {
      status: 200,
      headers,
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
