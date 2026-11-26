import { NextRequest } from "next/server";
import { proxyVendorTicketRequest } from "@/lib/server/vendor-ticket-api";

export function GET(request: NextRequest) {
  return proxyVendorTicketRequest(request, "", "GET", "/api/vendor/ticket-orders");
}
