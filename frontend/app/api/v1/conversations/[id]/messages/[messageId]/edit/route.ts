import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

function getForwardHeaders(request: Request): HeadersInit {
  const authHeader = request.headers.get("authorization");
  return {
    "Content-Type": "application/json",
    ...(authHeader ? { Authorization: authHeader } : {}),
  };
}

interface RouteParams {
  params: Promise<{ id: string; messageId: string }>;
}

/**
 * POST /api/v1/conversations/[id]/messages/[messageId]/edit
 * Edit a previous user message, truncate subsequent turns, and generate a new response.
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id, messageId } = await params;
    const body = await request.json().catch(() => ({}));

    if (!body || !body.content || !body.content.trim()) {
      return NextResponse.json(
        { detail: "Message content cannot be empty." },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/conversations/${id}/messages/${messageId}/edit`,
      {
        method: "POST",
        headers: getForwardHeaders(request),
        body: JSON.stringify(body),
      }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || "Failed to edit message" },
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
