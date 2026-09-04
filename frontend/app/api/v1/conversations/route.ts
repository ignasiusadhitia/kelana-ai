import { NextResponse } from "next/server";
import { getBffAuthHeaders } from "@/lib/bff-auth";

const BACKEND_URL = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

/**
 * GET /api/v1/conversations
 * List conversations for the authenticated user.
 */
export async function GET(request: Request) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/conversations`, {
      method: "GET",
      headers: getBffAuthHeaders(request),
    });

    const data = await response.json().catch(() => []);
    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || "Failed to fetch conversations" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { detail: `Backend connection error: ${errorMessage}` },
      { status: 502 }
    );
  }
}

/**
 * POST /api/v1/conversations
 * Create a new conversation.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const response = await fetch(`${BACKEND_URL}/api/v1/conversations`, {
      method: "POST",
      headers: getBffAuthHeaders(request),
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || "Failed to create conversation" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { detail: `Backend connection error: ${errorMessage}` },
      { status: 502 }
    );
  }
}
