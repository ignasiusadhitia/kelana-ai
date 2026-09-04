import { NextResponse } from "next/server";
import { getBffAuthHeaders } from "@/lib/bff-auth";

const BACKEND_URL = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/v1/trips/[id]/generate
 * Proxy endpoint to regenerate AI itinerary with Authorization forward.
 */
export async function POST(request: Request, context: RouteParams) {
  try {
    const { id } = await context.params;

    if (!id || !/^[A-Za-z0-9_-]{1,64}$/.test(id)) {
      return NextResponse.json(
        { detail: "Invalid trip ID parameter" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/trips/${id}/generate`,
      {
        method: "POST",
        headers: getBffAuthHeaders(request),
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
        { detail: data.detail || "Failed to regenerate AI itinerary" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("API AI regeneration error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { detail: `Backend connection error: ${errorMessage}` },
      { status: 502 }
    );
  }
}
