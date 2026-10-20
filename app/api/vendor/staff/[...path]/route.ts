import { NextRequest } from "next/server";
import { proxyVendorStaffRequest } from "@/lib/server/vendor-staff-api";

type Context = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, context: Context) {
  const { path } = await context.params;
  return proxyVendorStaffRequest(request, path);
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
