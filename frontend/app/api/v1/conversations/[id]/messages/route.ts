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
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/conversations/[id]/messages
 * Send message and receive context-aware response from Amazon Bedrock.
 * Supports real-time Server-Sent Events (SSE) streaming via ?stream=true.
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const isStream = searchParams.get("stream") === "true";

    const body = await request.json().catch(() => ({}));

    if (!body || !body.content || !body.content.trim()) {
      return NextResponse.json(
        { detail: "Message content cannot be empty." },
        { status: 400 }
      );
    }

    const targetUrl = `${BACKEND_URL}/api/v1/conversations/${id}/messages${
      isStream ? "?stream=true" : ""
    }`;

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: getForwardHeaders(request),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { detail: errorData.detail || "Failed to process message" },
        { status: response.status }
      );
    }

    // Stream SSE directly through to client if streaming requested
    if (isStream && response.body) {
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { detail: `Backend connection error: ${errorMessage}` },
      { status: 502 }
    );
  }
}
