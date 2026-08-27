import { NextResponse } from "next/server";

// ARCHITECTURE: Dynamic Server-Side Proxy Endpoint for Single Trip
// PATTERN: Proxy Pattern handling GET, PUT (Update Budget), and DELETE for /api/v1/trips/[id]
const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Helper to safely parse backend response (handling non-JSON error pages like 500 HTML)
 */
async function parseBackendResponse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text || `Backend returned status ${response.status}` };
  }
}

/**
 * GET /api/v1/trips/[id]
 * Proxy endpoint to retrieve a single trip by ID from FastAPI backend (reading PostgreSQL).
 */
export async function GET(request: Request, context: RouteParams) {
  try {
    const { id } = await context.params;
    const tripId = parseInt(id, 10);

    if (isNaN(tripId) || tripId <= 0) {
      return NextResponse.json(
        { detail: "Invalid trip ID parameter" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/trips/${tripId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await parseBackendResponse(response);

    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || `Trip with id ${tripId} not found` },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("API single trip proxy error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { detail: `Backend connection error: ${errorMessage}` },
      { status: 502 }
    );
  }
}

/**
 * PUT /api/v1/trips/[id]
 * Proxy endpoint to update trip budget and recalculate daily limits in FastAPI backend.
 */
export async function PUT(request: Request, context: RouteParams) {
  try {
    const { id } = await context.params;
    const tripId = parseInt(id, 10);

    if (isNaN(tripId) || tripId <= 0) {
      return NextResponse.json(
        { detail: "Invalid trip ID parameter" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body.budget !== "number" || body.budget <= 0) {
      return NextResponse.json(
        { detail: "Valid positive numeric budget is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/trips/${tripId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ budget: body.budget }),
    });

    const data = await parseBackendResponse(response);

    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || "Failed to update trip budget" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("API update budget error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { detail: `Backend connection error: ${errorMessage}` },
      { status: 502 }
    );
  }
}

/**
 * DELETE /api/v1/trips/[id]
 * Proxy endpoint to remove a trip from FastAPI database.
 */
export async function DELETE(request: Request, context: RouteParams) {
  try {
    const { id } = await context.params;
    const tripId = parseInt(id, 10);

    if (isNaN(tripId) || tripId <= 0) {
      return NextResponse.json(
        { detail: "Invalid trip ID parameter" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/trips/${tripId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await parseBackendResponse(response);
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
