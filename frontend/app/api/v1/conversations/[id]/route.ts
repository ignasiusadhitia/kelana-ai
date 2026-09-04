import { NextResponse } from "next/server";
import { getBffAuthHeaders } from "@/lib/bff-auth";

const BACKEND_URL = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/conversations/[id]
 * Fetch specific conversation details and its messages.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const response = await fetch(`${BACKEND_URL}/api/v1/conversations/${id}`, {
      method: "GET",
      headers: getBffAuthHeaders(request),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || `Failed to fetch conversation #${id}` },
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
 * PATCH /api/v1/conversations/[id]
 * Rename a conversation title.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const response = await fetch(`${BACKEND_URL}/api/v1/conversations/${id}`, {
      method: "PATCH",
      headers: getBffAuthHeaders(request),
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || `Failed to update conversation #${id}` },
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
 * DELETE /api/v1/conversations/[id]
 * Delete a conversation.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const response = await fetch(`${BACKEND_URL}/api/v1/conversations/${id}`, {
      method: "DELETE",
      headers: getBffAuthHeaders(request),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        { detail: data.detail || `Failed to delete conversation #${id}` },
        { status: response.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { detail: `Backend connection error: ${errorMessage}` },
      { status: 502 }
    );
  }
}
