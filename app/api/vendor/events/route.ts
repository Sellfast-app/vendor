import { NextRequest } from "next/server";
import { proxyVendorEventRequest } from "@/lib/server/vendor-ticket-api";

export function GET(request: NextRequest) {
  return proxyVendorEventRequest(request);
}

export function POST(request: NextRequest) {
  return proxyVendorEventRequest(request, undefined, "POST");
}
