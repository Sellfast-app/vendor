import { NextRequest } from "next/server";
import { proxyNotificationRequest } from "@/lib/server/notifications-api";

export async function GET(request: NextRequest) {
  return proxyNotificationRequest(request, "", "GET");
}
