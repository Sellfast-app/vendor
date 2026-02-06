import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://api.swiftree.app";

export async function POST(request: NextRequest) {
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

        const formData = await request.formData();

        console.log('📤 Uploading CAC document for store:', storeId);
        
        console.log('🔍 Checking form data field names:');
        const fieldNames = [];
        for (const key of formData.keys()) { 
            fieldNames.push(key);
        }
        console.log('Field names received:', fieldNames);

        const cacNumber = formData.get('cac');
        const docType = formData.get('doc_type');
        const fileField = formData.get('cert_media') || formData.get('file');

        console.log('📋 Form data received:');
        console.log('- CAC Number:', cacNumber);
        console.log('- Document Type:', docType);
        console.log('- File field:', fileField instanceof File ? `File: ${fileField.name}` : fileField);

        if (!cacNumber || !docType || !fileField) {
            return NextResponse.json(
                {
                    status: "error",
                    message: "Missing required fields: cac, doc_type, and file are required"
                },
                { status: 400 }
            );
        }

        if (!(fileField instanceof File)) {
            return NextResponse.json(
                {
                    status: "error",
                    message: "File field must contain a valid file"
                },
                { status: 400 }
            );
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); 

        try {
            const swiftreeFormData = new FormData();
            
            swiftreeFormData.append('cac', cacNumber);
            
            swiftreeFormData.append('cac', fileField);
            
            swiftreeFormData.append('doc_type', docType);

            console.log('🚀 Sending to Swiftree API:');
            for (const [key, value] of swiftreeFormData.entries()) { 
                if (value instanceof File) {
                    console.log(`${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }

            const response = await fetch(`${API_BASE_URL}/api/stores/${storeId}/cac`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: swiftreeFormData, 
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const contentType = response.headers.get("content-type");

            if (!contentType || !contentType.includes("application/json")) {
                const textResponse = await response.text();
                console.error("❌ Non-JSON response received:", textResponse.substring(0, 200));

                return NextResponse.json(
                    {
                        status: "error",
                        message: `Server returned unexpected response: ${response.status} ${response.statusText}`
                    },
                    { status: 502 }
                );
            }

            const result = await response.json();

            console.log('📥 API Response:', JSON.stringify(result, null, 2));

            if (!response.ok) {
                return NextResponse.json(
                    {
                        status: "error",
                        message: result.message || "Failed to upload CAC document"
                    },
                    { status: response.status }
                );
            }

            console.log('✅ CAC document uploaded successfully');

            return NextResponse.json({
                status: "success",
                message: result.message || "CAC document uploaded successfully",
                data: result.data
            });

        }// eslint-disable-next-line @typescript-eslint/no-explicit-any  
        catch (fetchError: any) {
            clearTimeout(timeoutId);

            if (fetchError.name === "AbortError") {
                console.error("⏱️ Request timeout");
                return NextResponse.json(
                    { status: "error", message: "Upload request timed out. Please try again." },
                    { status: 408 }
                );
            }

            console.error("❌ API connection error:", fetchError);
            return NextResponse.json(
                {
                    status: "error",
                    message: "Unable to connect to upload service. Please try again later."
                },
                { status: 503 }
            );
        }

    }// eslint-disable-next-line @typescript-eslint/no-explicit-any 
     catch (error: any) {
        console.error("❌ Unexpected error in CAC upload:", error);
        return NextResponse.json(
            { status: "error", message: "Internal server error" },
            { status: 500 }
        );
    }
}