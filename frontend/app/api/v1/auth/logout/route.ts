import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/bff-auth";

/**
 * POST /api/v1/auth/logout
 * Clears HttpOnly authentication session cookie from client.
 */
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  response.cookies.delete(AUTH_COOKIE_NAME);

  return response;
}
