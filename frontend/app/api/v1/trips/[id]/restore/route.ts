import { NextResponse } from "next/server";
import { getBffAuthHeaders } from "@/lib/bff-auth";

const BACKEND_URL = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

/**
 * POST /api/v1/trips/[id]/restore
 * Proxy endpoint to restore a soft-deleted trip.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await fetch(`${BACKEND_URL}/api/v1/trips/${id}/restore`, {
      method: "POST",
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
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { detail: `Backend connection error: ${errorMessage}` },
      { status: 502 }
    );
  }
}
