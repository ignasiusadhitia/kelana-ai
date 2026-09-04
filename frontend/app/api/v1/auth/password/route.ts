import { NextResponse } from "next/server";
import { getBffAuthHeaders } from "@/lib/bff-auth";

const BACKEND_URL = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

/**
 * PUT /api/v1/auth/password
 * Proxy endpoint to change user password on FastAPI backend.
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/password`, {
      method: "PUT",
      headers: getBffAuthHeaders(request),
      body: JSON.stringify(body),
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
    console.error("Auth password proxy error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { detail: `Backend connection error: ${errorMessage}` },
      { status: 502 }
    );
  }
}
