import { redirect } from "next/navigation";

/**
 * PAGE: /assistant (Travel Assistant & Knowledge Base)
 * Unified into /chat with dynamic intent routing and conversational memory.
 * Automatically redirects any incoming traffic or bookmarks directly to /chat.
 */
export default function AssistantPage() {
  redirect("/chat");
}
