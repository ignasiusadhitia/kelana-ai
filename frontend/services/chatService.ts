/**
 * SERVICE LAYER: Centralized HTTP Client for Multi-Turn AI Chat & Memory.
 * Manages conversation threads, message exchanges, title renames, and deletion.
 */

export interface ChatMessage {
  id: string | number;
  conversation_id: string | number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string | number;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  trip_id?: string | null;
  trip_destination?: string | null;
}

export interface ConversationDetail {
  id: string | number;
  title: string;
  created_at: string;
  updated_at: string;
  trip_id?: string | null;
  trip_destination?: string | null;
  messages: ChatMessage[];
}

function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
  };
}

/**
 * Fetch all conversations for the authenticated user.
 * @returns Promise resolving to a list of Conversation summaries.
 */
export async function listConversations(): Promise<Conversation[]> {
  const response = await fetch("/api/v1/conversations", {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fetch conversations");
  }

  return response.json();
}

/**
 * Create a new conversation session.
 * @param title Optional title for the new conversation thread.
 * @param tripId Optional public trip ID (trp_...) to link.
 * @returns Promise resolving to the newly created Conversation.
 */
export async function createConversation(title?: string, tripId?: string): Promise<Conversation> {
  const response = await fetch("/api/v1/conversations", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ title, trip_id: tripId || undefined }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create conversation");
  }

  return response.json();
}

/**
 * Get a specific conversation and all its messages.
 * @param id The unique conversation ID.
 * @returns Promise resolving to the ConversationDetail including messages.
 */
export async function getConversation(id: string | number): Promise<ConversationDetail> {
  const response = await fetch(`/api/v1/conversations/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to load conversation messages");
  }

  return response.json();
}

/**
 * Rename an existing conversation title.
 * @param id The unique conversation ID.
 * @param title The new title for the conversation.
 * @returns Promise resolving to the updated Conversation.
 */
export async function updateConversationTitle(id: string | number, title: string): Promise<Conversation> {
  const response = await fetch(`/api/v1/conversations/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to rename conversation");
  }

  return response.json();
}

/**
 * Delete a conversation thread and all cascaded messages.
 * @param id The unique conversation ID.
 */
export async function deleteConversation(id: string | number): Promise<void> {
  const response = await fetch(`/api/v1/conversations/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to delete conversation");
  }
}

/**
 * Send a message within a conversation and receive context-aware response from Amazon Bedrock.
 * @param conversationId The conversation ID.
 * @param content The user message text.
 * @returns Promise resolving to the assistant ChatMessage.
 */
export async function sendMessage(conversationId: string | number, content: string): Promise<ChatMessage> {
  const response = await fetch(`/api/v1/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    let errorDetail = "";
    try {
      const errorData = JSON.parse(errorText);
      errorDetail = errorData.detail || errorData.message || "";
    } catch {
      errorDetail = errorText.slice(0, 200);
    }
    throw new Error(errorDetail || `Failed to send message (HTTP ${response.status})`);
  }

  return response.json();
}

/**
 * Stream an assistant response in real-time using Server-Sent Events (SSE).
 * Calls onChunk(chunk) as deltas arrive, and onDone(messageId, title) when stream ends.
 */
export async function sendMessageStream(
  conversationId: string | number,
  content: string,
  onChunk: (chunk: string) => void,
  onDone: (data: { message_id: string | number; user_message_id?: string | number; title?: string }) => void
): Promise<void> {
  const response = await fetch(`/api/v1/conversations/${conversationId}/messages?stream=true`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    let errorDetail = "";
    try {
      const errorData = JSON.parse(errorText);
      errorDetail = errorData.detail || errorData.message || "";
    } catch {
      errorDetail = errorText.slice(0, 200);
    }
    throw new Error(errorDetail || `Failed to stream message (HTTP ${response.status})`);
  }

  const contentType = response.headers.get("content-type") || "";

  // Graceful fallback: If response is regular JSON rather than SSE, handle it seamlessly
  if (!contentType.includes("text/event-stream")) {
    const data = await response.json().catch(() => null);
    if (data) {
      const text = data.content || data.response || "";
      if (text) onChunk(text);
      onDone({ message_id: data.id, title: data.conversation_title });
      return;
    }
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("ReadableStream not supported by browser");
  }

  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const jsonStr = trimmed.replace(/^data:\s*/, "");
      try {
        const payload = JSON.parse(jsonStr);
        if (payload.chunk) {
          onChunk(payload.chunk);
        }
        if (payload.done) {
          onDone({
            message_id: payload.message_id,
            user_message_id: payload.user_message_id,
            title: payload.title,
          });
        }
      } catch (e) {
        console.warn("Failed to parse SSE line:", trimmed, e);
      }
    }
  }

  // Flush remaining buffer if ending on complete event
  if (buffer.trim().startsWith("data:")) {
    try {
      const payload = JSON.parse(buffer.trim().replace(/^data:\s*/, ""));
      if (payload.chunk) onChunk(payload.chunk);
      if (payload.done) {
        onDone({
          message_id: payload.message_id,
          user_message_id: payload.user_message_id,
          title: payload.title,
        });
      }
    } catch (e) {
      console.warn("Failed to parse remaining SSE buffer:", buffer, e);
    }
  }
}

/**
 * Edit a past user message, truncate subsequent messages from that point,
 * and receive fresh assistant response.
 * @param conversationId The conversation ID.
 * @param messageId The user message ID to edit.
 * @param content The new message text.
 * @returns Promise resolving to updated ConversationDetail.
 */
export async function editMessageAndRegenerate(
  conversationId: string | number,
  messageId: string | number,
  content: string
): Promise<ConversationDetail> {
  const response = await fetch(
    `/api/v1/conversations/${conversationId}/messages/${messageId}/edit`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to edit message");
  }

  return response.json();
}

/**
 * Regenerate the latest assistant message.
 * @param conversationId The conversation ID.
 * @returns Promise resolving to updated ConversationDetail.
 */
export async function regenerateResponse(conversationId: string | number): Promise<ConversationDetail> {
  const response = await fetch(`/api/v1/conversations/${conversationId}/regenerate`, {
    method: "POST",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to regenerate response");
  }

  return response.json();
}

