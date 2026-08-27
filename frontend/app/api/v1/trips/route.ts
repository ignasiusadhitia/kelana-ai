import { NextResponse } from "next/server";
import { tripFormSchema } from "@/schemas/tripSchema";

// ARCHITECTURE: Next.js Route Handler acting as a secure Server-Side Reverse Proxy
// PATTERN: Proxy Pattern with Defense-in-Depth Schema Validation shielding direct backend access
const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

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

    // Forward sanitized payload to FastAPI backend service
    const response = await fetch(`${BACKEND_URL}/api/v1/trips`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validation.data),
    });

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { detail: rawText || `Backend error (${response.status})` };
    }

    // Propagate backend HTTP status and error details
    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || "Failed to create trip from backend" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
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
 * Proxy endpoint to retrieve all saved trips from backend database.
 */
export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/trips`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
