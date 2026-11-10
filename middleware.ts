import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const publicRoutes = ["/login", "/signup", "/terms", "/reset", "/forgot"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Keep public pages, API handlers, and static assets available without a session.
  if (
    isPublicRoute ||
    pathname.startsWith("/_next/") ||
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/icons/") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname.endsWith(".webmanifest") ||
    pathname.endsWith(".js") ||
    pathname.match(/\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot|css|mp4|webm)$/i)
  ) {
    return NextResponse.next();
  }

  if (request.cookies.get("accessToken")?.value) return NextResponse.next();

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("from", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
