import { NextResponse } from "next/server";
import { getBffAuthHeaders } from "@/lib/bff-auth";

const BACKEND_URL = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PATCH /api/v1/trips/[id]/recommendation
 * Proxy endpoint to update trip recommendation with Authorization forward.
 */
export async function PATCH(request: Request, context: RouteParams) {
  try {
    const { id } = await context.params;

    if (!id || !/^[A-Za-z0-9_-]{1,64}$/.test(id)) {
      return NextResponse.json(
        { detail: "Invalid trip ID parameter" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { detail: "Valid JSON request body is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/trips/${id}/recommendation`,
      {
        method: "PATCH",
        headers: getBffAuthHeaders(request),
        body: JSON.stringify(body),
      }
    );

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { detail: rawText || `Backend returned status ${response.status}` };
    }

    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || "Failed to update trip recommendation" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("API update recommendation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { detail: `Backend connection error: ${errorMessage}` },
      { status: 502 }
    );
  }
}
