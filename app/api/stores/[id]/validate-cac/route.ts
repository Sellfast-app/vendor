import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  ?.trim()
  .replace(/\/+$/, "");

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json(
        { status: "error", message: "Store API is not configured" },
        { status: 500 }
      );
    }

    const { id } = await context.params;
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    const authenticatedStoreId = cookieStore.get("store_id")?.value;

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Authentication required" },
        { status: 401 }
      );
    }

    if (!id || !authenticatedStoreId || id !== authenticatedStoreId) {
      return NextResponse.json(
        { status: "error", message: "Invalid store ID" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const cacNumber = formData.get("cac");
    const docType = formData.get("doc_type");

    if (
      typeof cacNumber !== "string" ||
      !cacNumber.trim() ||
      docType !== "cac"
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "A CAC registration number and doc_type=cac are required",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/stores/${encodeURIComponent(id)}/validate-cac`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cac: cacNumber.trim(),
        }),
        cache: "no-store",
      }
    );

    const responseText = await response.text();
    let result: Record<string, unknown> = {};

    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      result = {};
    }

    if (!response.ok) {
      const message =
        (typeof result.message === "string" && result.message) ||
        (typeof result.error === "string" && result.error) ||
        responseText ||
        "Failed to validate CAC registration number";

      return NextResponse.json(
        { status: "error", message },
        { status: response.status }
      );
    }

    return NextResponse.json({
      ...result,
      status: "success",
      message:
        (typeof result.message === "string" && result.message) ||
        "CAC registration number validated successfully",
    });
  } catch (error) {
    console.error("Error validating CAC registration number:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
