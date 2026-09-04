import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/bff-auth";

/**
 * ARCHITECTURE: Next.js Edge Middleware for Server-Side Route Protection
 * Intercepts requests before pages render:
 * - Redirects unauthenticated users attempting to access /profile to /login.
 * - Redirects already-authenticated users on /login or /register to /trips.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  // 1. Protected routes: redirect to login if session cookie is absent
  if (pathname.startsWith("/profile") && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Guest-only auth routes: redirect to /trips if already signed in
  if ((pathname === "/login" || pathname === "/register") && token) {
    return NextResponse.redirect(new URL("/trips", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/login", "/register"],
};
