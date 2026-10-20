import { NextRequest } from "next/server";
import { proxyVendorTicketRequest } from "@/lib/server/vendor-ticket-api";

export function POST(request: NextRequest) {
  return proxyVendorTicketRequest(request, "check-in", "POST");
}
