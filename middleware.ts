import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const pathname = request.nextUrl.pathname;

  const publicRoutes = [
    "/login", 
    "/signup", 
    "/reset", 
    "/forgot",
    "/manifest.json",   
    "/sw.js",         
    "/workbox-*.js",   
    "/swe-worker-*.js", 
  ];

  // Allow public routes, API routes, and static assets
  if (
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/_next") || 
    pathname.startsWith("/api") || 
    pathname.startsWith("/favicon.ico") || 
    pathname.startsWith("/icons/") || 
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/) 
  ) {
    return NextResponse.next();
  }

  // Redirect to login if no access token is found
  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};