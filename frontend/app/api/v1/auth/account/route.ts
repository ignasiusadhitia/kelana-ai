import { NextResponse } from "next/server";
import { getBffAuthHeaders, AUTH_COOKIE_NAME } from "@/lib/bff-auth";

const BACKEND_URL = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

/**
 * DELETE /api/v1/auth/account
 * Proxy endpoint to permanently delete user account and associated records on FastAPI backend.
 */
export async function DELETE(request: Request) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/account`, {
      method: "DELETE",
      headers: getBffAuthHeaders(request),
    });

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { detail: rawText || `Backend error (${response.status})` };
    }

    const nextResponse = NextResponse.json(data, { status: response.status });
    if (response.ok) {
      nextResponse.cookies.delete(AUTH_COOKIE_NAME);
    }
    return nextResponse;
  } catch (error: unknown) {
    console.error("Auth delete account proxy error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { detail: `Backend connection error: ${errorMessage}` },
      { status: 502 }
    );
  }
}
