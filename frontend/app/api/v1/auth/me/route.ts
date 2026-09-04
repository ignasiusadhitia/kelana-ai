import { NextResponse } from "next/server";
import { getBffAuthHeaders } from "@/lib/bff-auth";

const BACKEND_URL = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

/**
 * GET /api/v1/auth/me
 * Proxy endpoint to retrieve authenticated user profile and stats from FastAPI backend.
 */
export async function GET(request: Request) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
      method: "GET",
      headers: getBffAuthHeaders(request),
    });

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { detail: rawText || `Backend error (${response.status})` };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    console.error("Auth me proxy error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { detail: `Backend connection error: ${errorMessage}` },
      { status: 502 }
    );
  }
}
