import { NextResponse } from "next/server";
import { tripFormSchema } from "@/schemas/tripSchema";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function getForwardHeaders(request: Request): HeadersInit {
  const authHeader = request.headers.get("authorization");
  return {
    "Content-Type": "application/json",
    ...(authHeader ? { Authorization: authHeader } : {}),
  };
}

/**
 * POST /api/v1/trips
 * Proxy endpoint to validate, create a trip, and generate AI recommendations via FastAPI backend.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { detail: "Invalid JSON payload in request body" },
        { status: 400 }
      );
    }

    // Defense-in-Depth: Validate payload schema at the proxy layer before hitting the backend
    const validation = tripFormSchema.safeParse(body);
    if (!validation.success) {
      const errorDetails = validation.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      return NextResponse.json(
        { detail: `Validation Error: ${errorDetails}` },
        { status: 422 }
      );
    }

    // Forward sanitized payload with Authorization header to FastAPI backend
    const response = await fetch(`${BACKEND_URL}/api/v1/trips`, {
      method: "POST",
      headers: getForwardHeaders(request),
      body: JSON.stringify(validation.data),
    });

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { detail: rawText || `Backend error (${response.status})` };
    }

    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || "Failed to create trip from backend" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    console.error("API proxy error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { detail: `Backend connection error: ${errorMessage}` },
      { status: 502 }
    );
  }
}

/**
 * GET /api/v1/trips
 * Proxy endpoint to retrieve all saved trips for the authenticated user.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") || "active";

    const response = await fetch(`${BACKEND_URL}/api/v1/trips?status=${encodeURIComponent(statusParam)}`, {
      method: "GET",
      headers: getForwardHeaders(request),
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
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { detail: `Backend connection error: ${errorMessage}` },
      { status: 502 }
    );
  }
}
