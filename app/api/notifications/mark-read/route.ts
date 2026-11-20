import { NextRequest, NextResponse } from "next/server";
import { proxyNotificationRequest } from "@/lib/server/notifications-api";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.ids)) return NextResponse.json({ status: "failed", message: "Notification IDs are required" }, { status: 400 });
  return proxyNotificationRequest(request, "/mark-read", "POST", { ids: body.ids });
}
