import { NextRequest, NextResponse } from "next/server";
import { proxyNotificationRequest } from "@/lib/server/notifications-api";

export async function POST(request: NextRequest) {
  const storeId = request.cookies.get("store_id")?.value;
  if (!storeId) return NextResponse.json({ status: "failed", message: "Store ID not found" }, { status: 400 });
  return proxyNotificationRequest(request, "/mark-all-read", "POST", { storeId });
}
