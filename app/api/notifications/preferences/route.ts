import { NextRequest, NextResponse } from "next/server";
import { proxyNotificationRequest } from "@/lib/server/notifications-api";

export async function GET(request: NextRequest) {
  return proxyNotificationRequest(request, "/preferences", "GET");
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (typeof body?.email_enabled !== "boolean" || typeof body?.whatsapp_enabled !== "boolean") {
    return NextResponse.json({ status: "failed", message: "Choose valid notification preferences" }, { status: 400 });
  }
  return proxyNotificationRequest(request, "/preferences", "PATCH", {
    email_enabled: body.email_enabled,
    whatsapp_enabled: body.whatsapp_enabled,
  });
}
