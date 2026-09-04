import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * POST /api/v1/assistant
 * Proxy endpoint to query Amazon Bedrock Knowledge Base assistant on FastAPI backend.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || !body.question || !body.question.trim()) {
      return NextResponse.json(
        { detail: "Please provide a valid question." },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("authorization");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/assistant`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        question: body.question.trim(),
        session_id: body.session_id || null,
        use_rag: body.use_rag !== false,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || "Failed to get answer from knowledge assistant" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    console.error("Assistant proxy error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { detail: `Backend connection error: ${errorMessage}` },
      { status: 502 }
    );
  }
}
