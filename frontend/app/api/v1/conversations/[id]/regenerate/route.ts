import { NextResponse } from "next/server";
import { getBffAuthHeaders } from "@/lib/bff-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BACKEND_URL = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/conversations/[id]/regenerate
 * Regenerate the latest assistant response.
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const response = await fetch(`${BACKEND_URL}/api/v1/conversations/${id}/regenerate`, {
      method: "POST",
      headers: getBffAuthHeaders(request),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || "Failed to regenerate response" },
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
