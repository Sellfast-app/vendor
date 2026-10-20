import { NextRequest } from "next/server";
import { proxyVendorStaffRequest } from "@/lib/server/vendor-staff-api";

export const GET = (request: NextRequest) => proxyVendorStaffRequest(request);
export const POST = (request: NextRequest) => proxyVendorStaffRequest(request);
