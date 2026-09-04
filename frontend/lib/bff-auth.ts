import { NextRequest } from "next/server";

// ARCHITECTURE: BFF Auth Helper — Centralized HttpOnly Cookie Token Extractor
// Reads `kelana_token` HttpOnly cookie server-side and builds Authorization header
// for forwarding to FastAPI backend. Used by all 16+ proxy route handlers.
//
// Security: The token never travels through client JavaScript — the browser
// automatically attaches the HttpOnly cookie to each same-origin request to /api/v1/*,
// and this function extracts it on the server before forwarding to FastAPI.

export const SEVEN_DAYS = 60 * 60 * 24 * 7; // 604800 seconds
export const AUTH_COOKIE_NAME = "kelana_token";

/**
 * Builds headers for BFF → FastAPI forwarding, reading JWT from HttpOnly cookie.
 * Supports NextRequest, standard Request with Cookie header, or fallback Authorization header.
 */
export function getBffAuthHeaders(request: NextRequest | Request): Record<string, string> {
  let token: string | undefined;

  // 1. Check if request has NextRequest .cookies helper
  if ("cookies" in request && typeof (request as NextRequest).cookies?.get === "function") {
    token = (request as NextRequest).cookies.get(AUTH_COOKIE_NAME)?.value;
  }

  // 2. Fallback: Parse Cookie header string
  if (!token) {
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]+)`));
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }
  }

  // 3. Backward-compatibility fallback: Check Authorization header
  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      return {
        "Content-Type": "application/json",
        Authorization: authHeader,
      };
    }
  }

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Cookie configuration for `kelana_token` session cookie.
 * HttpOnly: JS cannot read it (XSS protection).
 * Secure: only sent over HTTPS in production.
 * SameSite=Lax: sent on same-origin and top-level navigations; blocks CSRF.
 */
export const SESSION_COOKIE_OPTIONS = {
  name: AUTH_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SEVEN_DAYS,
};
