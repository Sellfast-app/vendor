// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const pathname = request.nextUrl.pathname;

  const publicRoutes = ["/login", "/signup",  "/reset", "/forgot"];

  // Allow public routes, API routes, and static assets
  if (
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/_next") || // Next.js static files
    pathname.startsWith("/api") || // API routes
    pathname.startsWith("/favicon.ico") // Favicon
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