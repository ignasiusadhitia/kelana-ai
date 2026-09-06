/**
 * SERVICE LAYER: RAG Travel Assistant Knowledge Base Client.
 * Communicates with backend Amazon Bedrock Agent Runtime proxy to retrieve
 * grounded travel knowledge and official document citations.
 */

export interface SourceObject {
  document_id?: string;
  location?: {
    s3Location?: {
      uri?: string;
    };
    type?: string;
  };
  metadata?: {
    _document_title?: string;
    _file_type?: string;
    [key: string]: unknown;
  };
  score?: number;
}

export interface AssistantCitation {
  content?: string;
  source?: string;
}

export interface AssistantResponse {
  question: string;
  answer: string;
  source?: SourceObject[] | string | null;
  citations: AssistantCitation[];
  session_id?: string | null;
  user_id?: number | null;
  use_rag?: boolean;
  mode?: "rag" | "base_model";
}

/**
 * Dispatches an AI assistant query to the backend API, optionally specifying
 * session identifier and RAG retrieval enablement.
 */
export async function askAssistant(
  question: string,
  sessionId?: string,
  useRag: boolean = true
): Promise<AssistantResponse> {
  const response = await fetch("/api/v1/assistant", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      session_id: sessionId || null,
      use_rag: useRag,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to retrieve response from travel assistant.");
  }

  return response.json();
}
