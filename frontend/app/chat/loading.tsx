import { ChatPageSkeleton } from "@/components/chat/ChatSkeletons";

/**
 * Route-specific loading boundary for /chat.
 * Displays the chat skeleton shell instantly during Next.js navigation,
 * preventing blank screens, spinners, or full-page splash flickers.
 */
export default function ChatLoading() {
  return <ChatPageSkeleton />;
}
