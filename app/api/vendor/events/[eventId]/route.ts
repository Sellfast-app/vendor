import { NextRequest } from "next/server";
import { proxyVendorEventRequest } from "@/lib/server/vendor-ticket-api";

export function PATCH(request: NextRequest, context: { params: Promise<{ eventId: string }> }) {
  return context.params.then(({ eventId }) => proxyVendorEventRequest(request, eventId, "PATCH"));
}
