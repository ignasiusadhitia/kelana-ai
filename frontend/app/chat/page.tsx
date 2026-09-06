"use client";

/**
 * PAGE: /chat (Multi-Turn AI Travel Chat)
 * Interactive conversational travel planner with multi-turn context and thread management.
 */

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";

// Lazy-load accessible confirmation dialog modal
const ConfirmDialog = dynamic(
  () => import("@/components/ui/confirm-dialog").then((mod) => mod.ConfirmDialog),
  { ssr: false }
);
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useAuth } from "@/hooks/useAuth";
import {
  listConversations,
  createConversation,
  getConversation,
  updateConversationTitle,
  deleteConversation,
  sendMessage,
  sendMessageStream,
  editMessageAndRegenerate,
  regenerateResponse,
  Conversation,
  ChatMessage,
} from "@/services/chatService";
import { updateTripRecommendation } from "@/services/tripService";
import { stripConversationalPreamble } from "@/lib/utils";
import {
  Send,
  Bot,
  User,
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Copy,
  RotateCw,
  RotateCcw,
  AlertCircle,
  Loader2,
  Lock,
  LogIn,
  Sparkles,
  Menu,
  Clock,
  Compass,
  Map,
  Home,
  Search,
  BookmarkPlus,
  BookmarkCheck,
  ChevronDown,
} from "lucide-react";
import {
  SidebarConversationSkeleton,
  MessageThreadSkeleton,
  ThinkingMessageSkeleton,
  EmptySidebarState,
  ChatPageSkeleton,
} from "@/components/chat/ChatSkeletons";
import { SaveChatTripModal } from "@/components/chat/SaveChatTripModal";
import { LinkedTripBanner } from "@/components/chat/LinkedTripBanner";
import { SuggestedPromptsGrid } from "@/components/chat/SuggestedPromptsGrid";
import { ChatMessageItem } from "@/components/chat/ChatMessageItem";
import { ChatInputArea } from "@/components/chat/ChatInputArea";
import {
  SUGGESTED_PROMPTS,
  parseMessageContentAndSources,
  isFailedMessage,
  formatTimestamp,
  formatFullDateTooltip,
  formatDateDivider,
  formatSidebarTimestamp,
} from "@/lib/chatUtils";

function ChatContent() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlChatId = searchParams.get("id");
  const urlTripId = searchParams.get("trip_id");

  // State for linked trip context (Model 3)
  const [linkedTripId, setLinkedTripId] = useState<string | null>(null);
  const [linkedTripDestination, setLinkedTripDestination] = useState<string | null>(null);

  // State for conversation list and active chat
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Sidebar toggle state (Default closed on mobile, open on desktop)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Renaming state
  const [editingConvId, setEditingConvId] = useState<string | number | null>(null);
  const [editTitleInput, setEditTitleInput] = useState("");

  // Deletion confirmation modal state
  const [convToDelete, setConvToDelete] = useState<string | number | null>(null);
  const [isDeletingConv, setIsDeletingConv] = useState(false);

  // Message interaction states (Copy, Edit, Regenerate)
  const [copiedMessageId, setCopiedMessageId] = useState<string | number | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | number | null>(null);
  const [editMessageInput, setEditMessageInput] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regeneratingMessageId, setRegeneratingMessageId] = useState<string | number | null>(null);

  // Search filter for sidebar conversations
  const [searchConvQuery, setSearchConvQuery] = useState("");

  // Save chat as trip / Apply to Blueprint states
  const [saveTripModalOpen, setSaveTripModalOpen] = useState(false);
  const [tripToSaveText, setTripToSaveText] = useState("");
  const [tripToSaveMessageId, setTripToSaveMessageId] = useState<string | number | null>(null);
  const [tripToSaveUserPrompt, setTripToSaveUserPrompt] = useState("");
  const [applyingBlueprintMessageId, setApplyingBlueprintMessageId] = useState<string | number | null>(null);
  const [savedMessageIds, setSavedMessageIds] = useState<Set<string | number>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem("kelana_saved_trip_msg_ids");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch {
      // ignore
    }
    return new Set();
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSendingRef = useRef(false);

  // Scroll management: Anti-scroll hijacking & instant snap on conversation load
  const [isAtBottom, setIsAtBottom] = useState(true);
  const isFirstLoadRef = useRef(true);
  const prevConvIdRef = useRef<string | number | null>(null);

  const scrollToBottom = (behavior: "auto" | "smooth" = "smooth") => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior,
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setIsAtBottom(distanceFromBottom <= 120);
  };

  // Reset first-load flag when conversation changes
  useEffect(() => {
    if (prevConvIdRef.current !== activeConversationId) {
      isFirstLoadRef.current = true;
      prevConvIdRef.current = activeConversationId;
    }
  }, [activeConversationId]);

  // Set initial desktop sidebar state
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  // Auto redirect unauthenticated users
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login?redirect=/chat");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Load conversations list on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated]);

  // Smart auto-scroll: Instant on load/switch, smooth only if already near bottom
  useEffect(() => {
    if (isLoadingMessages) return;

    if (isFirstLoadRef.current) {
      // Instant snap when conversation opens - no motion sickness
      requestAnimationFrame(() => {
        scrollToBottom("auto");
        isFirstLoadRef.current = false;
        setIsAtBottom(true);
      });
    } else if (isAtBottom) {
      // Smooth scroll on new turns only if user was already at bottom
      scrollToBottom("smooth");
    }
  }, [messages, isSending, isLoadingMessages, isAtBottom]);

  // Online / offline connection listener
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auto-grow textarea up to 128px smoothly as user types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
  }, [input]);

  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const data = await listConversations();
      setConversations(data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Synchronize active conversation with URL query parameter (?id=...)
  useEffect(() => {
    if (!isAuthenticated) return;

    if (urlChatId) {
      if (String(activeConversationId) !== String(urlChatId)) {
        selectConversation(urlChatId, false);
      }
    } else {
      if (activeConversationId !== null) {
        setActiveConversationId(null);
        setMessages([]);
      }
    }
  }, [urlChatId, isAuthenticated]);

  // Synchronize linked trip with URL query parameter (?trip_id=...)
  // Q2 Decision: If an existing conversation is already linked to this trip, resume it!
  useEffect(() => {
    if (!isAuthenticated || !urlTripId) return;

    // Check if an existing conversation is already linked to this trip
    const existing = conversations.find(
      (c) => c.trip_id && String(c.trip_id) === String(urlTripId)
    );

    if (existing) {
      // Resume existing conversation
      selectConversation(existing.id, true);
    } else {
      // Load trip metadata to show context banner and dynamic prompts for a new chat
      fetch(`/api/v1/trips/${urlTripId}`, { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((trip) => {
          if (trip) {
            setLinkedTripId(String(trip.id));
            setLinkedTripDestination(trip.destination);
          }
        })
        .catch((err) => {
          console.warn("Failed to fetch linked trip:", err);
          setLinkedTripId(null);
          setLinkedTripDestination(null);
        });
    }
  }, [urlTripId, conversations, isAuthenticated]);

  const selectConversation = async (convId: string | number, updateUrl = true) => {
    if (isSending) return;

    // On mobile, close sidebar drawer when a chat is selected
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    if (updateUrl) {
      router.push(`/chat?id=${convId}`, { scroll: false });
    }

    if (String(convId) === String(activeConversationId) && messages.length > 0) return;
    try {
      setActiveConversationId(convId);
      setIsLoadingMessages(true);
      const detail = await getConversation(convId);
      setMessages(detail.messages || []);
      if (detail.trip_id) {
        setLinkedTripId(String(detail.trip_id));
        setLinkedTripDestination(detail.trip_destination || null);
      } else if (!urlTripId) {
        setLinkedTripId(null);
        setLinkedTripDestination(null);
      }
    } catch (err) {
      console.error(`Failed to load conversation #${convId}:`, err);
      toast.error("Conversation not found or failed to load.", {
        title: "Chat Not Found",
      });
      setActiveConversationId(null);
      setMessages([]);
      router.replace("/chat", { scroll: false });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleNewConversation = () => {
    if (isSending) return;

    // On mobile, close sidebar drawer when creating a new chat
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    setActiveConversationId(null);
    setMessages([]);
    setLinkedTripId(null);
    setLinkedTripDestination(null);
    router.push("/chat", { scroll: false });
    textareaRef.current?.focus();
  };

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSending) return;
    setEditingConvId(conv.id);
    setEditTitleInput(conv.title);
  };

  const handleSaveRename = async (convId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editTitleInput.trim()) {
      setEditingConvId(null);
      return;
    }
    try {
      const updated = await updateConversationTitle(convId, editTitleInput.trim());
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, title: updated.title } : c))
      );
      setEditingConvId(null);
      toast.success("Conversation title updated successfully.", {
        title: "Title Updated",
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to rename conversation.",
        { title: "Rename Failed" }
      );
      console.error("Failed to rename conversation:", err);
    }
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(null);
  };

  const handleOpenDeleteDialog = (convId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSending) return;
    setConvToDelete(convId);
  };

  const handleConfirmDeleteConversation = async () => {
    if (convToDelete === null || isSending) return;
    setIsDeletingConv(true);
    try {
      await deleteConversation(convToDelete);
      const remaining = conversations.filter((c) => c.id !== convToDelete);
      setConversations(remaining);
      if (String(activeConversationId) === String(convToDelete)) {
        setActiveConversationId(null);
        setMessages([]);
        router.push("/chat", { scroll: false });
      }
      toast.success("Conversation thread deleted successfully.", {
        title: "Thread Deleted",
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete conversation thread.",
        { title: "Delete Failed" }
      );
      console.error("Failed to delete conversation:", err);
    } finally {
      setIsDeletingConv(false);
      setConvToDelete(null);
    }
  };

  const handleCopyMessage = useCallback(async (id: string | number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(id);
      setTimeout(() => {
        setCopiedMessageId((prev) => (prev === id ? null : prev));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy message to clipboard:", err);
      toast.error("Failed to copy to clipboard.", { title: "Copy Failed" });
    }
  }, []);

  const handleStartEditMessage = useCallback(
    (msg: ChatMessage) => {
      if (isSending || isSubmittingEdit || isRegenerating) return;
      setEditingMessageId(msg.id);
      setEditMessageInput(msg.content);
    },
    [isSending, isSubmittingEdit, isRegenerating]
  );

  const handleCancelEditMessage = useCallback(() => {
    setEditingMessageId(null);
    setEditMessageInput("");
  }, []);

  const handleSaveEditMessage = async (msgId: string | number) => {
    if (!activeConversationId || isSending || isSubmittingEdit || isSendingRef.current) return;
    const text = editMessageInput.trim();
    if (!text) return;

    isSendingRef.current = true;
    setIsSubmittingEdit(true);
    setIsSending(true);
    setIsRegenerating(true);
    try {
      let targetMsgId = msgId;

      // Robust ID resolution: if msgId is a temporary client-side ID, reconcile with DB first
      const isTempId =
        String(targetMsgId).startsWith("temp_") ||
        (typeof targetMsgId === "number" && targetMsgId > 1_000_000_000_000);
      if (isTempId) {
        try {
          const fresh = await getConversation(activeConversationId);
          if (fresh && fresh.messages) {
            setMessages(fresh.messages);
            const userMsgs = fresh.messages.filter((m) => m.role === "user");
            if (userMsgs.length > 0) {
              targetMsgId = userMsgs[userMsgs.length - 1].id;
            }
          }
        } catch (reconcileErr) {
          console.warn("Failed to reconcile message ID before edit:", reconcileErr);
        }
      }

      // Optimistically update edited user turn and replace subsequent assistant turn with loading skeleton
      setMessages((prev) => {
        const editIdx = prev.findIndex((m) => String(m.id) === String(targetMsgId || msgId));
        if (editIdx === -1) return prev;
        const updatedUserMsg = { ...prev[editIdx], content: text };
        const tempAiMsg: ChatMessage = {
          id: `temp_regen_${Date.now()}`,
          conversation_id: activeConversationId,
          role: "assistant",
          content: "",
          created_at: new Date().toISOString(),
        };
        return [...prev.slice(0, editIdx), updatedUserMsg, tempAiMsg];
      });
      setEditingMessageId(null);
      setEditMessageInput("");
      setIsAtBottom(true);
      requestAnimationFrame(() => scrollToBottom("smooth"));

      const updated = await editMessageAndRegenerate(activeConversationId, targetMsgId, text);
      setMessages(updated.messages || []);
      setConversations((prev) => {
        const remaining = prev.filter((c) => String(c.id) !== String(activeConversationId));
        const existing = prev.find((c) => String(c.id) === String(activeConversationId));
        const item: Conversation = {
          id: updated.id,
          title: updated.title,
          created_at: updated.created_at,
          updated_at: updated.updated_at,
          message_count: updated.messages?.length || existing?.message_count || 0,
        };
        return [item, ...remaining];
      });
      toast.success("Message edited and discussion updated.", { title: "Turn Updated" });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update message.",
        { title: "Edit Failed" }
      );
      console.error("Failed to edit message:", err);
      try {
        const detail = await getConversation(activeConversationId);
        if (detail?.messages) setMessages(detail.messages);
      } catch {
        // ignore secondary failure
      }
    } finally {
      isSendingRef.current = false;
      setIsSubmittingEdit(false);
      setIsRegenerating(false);
      setIsSending(false);
    }
  };

  const handleRegenerateResponse = async () => {
    if (!activeConversationId || isSending || isRegenerating || isSendingRef.current) return;

    // Find the latest assistant message to regenerate
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant") return;

    isSendingRef.current = true;
    setIsRegenerating(true);
    setIsSending(true);
    setRegeneratingMessageId(lastMsg.id);

    // Optimistically empty the assistant message content so it immediately renders ThinkingMessageSkeleton in-place
    setMessages((prev) =>
      prev.map((m) =>
        m.id === lastMsg.id
          ? { ...m, content: "", is_error: false }
          : m
      )
    );
    setIsAtBottom(true);
    requestAnimationFrame(() => scrollToBottom("smooth"));

    try {
      const updated = await regenerateResponse(activeConversationId);
      setMessages(updated.messages || []);
      setConversations((prev) => {
        const remaining = prev.filter((c) => String(c.id) !== String(activeConversationId));
        const existing = prev.find((c) => String(c.id) === String(activeConversationId));
        const item: Conversation = {
          id: updated.id,
          title: updated.title,
          created_at: updated.created_at,
          updated_at: updated.updated_at,
          message_count: updated.messages?.length || existing?.message_count || 0,
        };
        return [item, ...remaining];
      });
      toast.success("Response regenerated successfully.", { title: "Regenerated" });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to regenerate response.",
        { title: "Regeneration Failed" }
      );
      console.error("Failed to regenerate response:", err);
      // Re-fetch messages from server to restore correct state
      try {
        const detail = await getConversation(activeConversationId);
        if (detail?.messages) setMessages(detail.messages);
      } catch {
        // ignore secondary failure
      }
    } finally {
      isSendingRef.current = false;
      setRegeneratingMessageId(null);
      setIsRegenerating(false);
      setIsSending(false);
    }
  };

  const handleOpenSaveTrip = (rawItinerary: string, messageId: string | number) => {
    if (!isAuthenticated) {
      toast.info("Please sign in to save itineraries to your dashboard.", {
        title: "Sign In Required",
      });
      router.push("/login?redirect=/chat");
      return;
    }
    setTripToSaveText(rawItinerary);
    setTripToSaveMessageId(messageId);

    // Extract the preceding user prompt for high-precision metadata extraction
    const msgIdx = messages.findIndex((m) => String(m.id) === String(messageId));
    let prompt = "";
    if (msgIdx > 0) {
      for (let i = msgIdx - 1; i >= 0; i--) {
        if (messages[i].role === "user") {
          prompt = messages[i].content;
          break;
        }
      }
    } else {
      const userMsgs = messages.filter((m) => m.role === "user");
      if (userMsgs.length > 0) {
        prompt = userMsgs[userMsgs.length - 1].content;
      }
    }
    setTripToSaveUserPrompt(prompt);
    setSaveTripModalOpen(true);
  };

  const handleTripSaved = () => {
    if (tripToSaveMessageId !== null) {
      setSavedMessageIds((prev) => {
        const next = new Set(prev).add(tripToSaveMessageId);
        try {
          localStorage.setItem("kelana_saved_trip_msg_ids", JSON.stringify(Array.from(next)));
        } catch {
          // Ignore storage quota errors silently
        }
        return next;
      });
    }
  };

  const activeConversation = conversations.find(
    (c) => String(c.id) === String(activeConversationId)
  );
  const currentTripId = activeConversation?.trip_id || linkedTripId;
  const currentTripDestination =
    activeConversation?.trip_destination || linkedTripDestination;

  const handleNavigateToTrip = useCallback(
    (tripId?: string | null) => {
      router.push(tripId ? `/trips/${tripId}` : "/trips");
    },
    [router]
  );

  const handleApplyToBlueprint = async (aiText: string, messageId: string | number) => {
    if (!currentTripId) return;
    if (!isAuthenticated) {
      toast.info("Please sign in to update trip blueprints.", {
        title: "Sign In Required",
      });
      router.push("/login?redirect=/chat");
      return;
    }

    try {
      setApplyingBlueprintMessageId(messageId);
      const cleanedText = stripConversationalPreamble(aiText);
      await updateTripRecommendation(currentTripId, cleanedText);
      setSavedMessageIds((prev) => {
        const next = new Set(prev).add(messageId);
        try {
          localStorage.setItem("kelana_saved_trip_msg_ids", JSON.stringify(Array.from(next)));
        } catch {
          // Ignore storage quota errors silently
        }
        return next;
      });
      toast.success("Blueprint updated! Opening your trip page...", {
        title: "Blueprint Applied",
      });
      router.push(`/trips/${currentTripId}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to apply itinerary to Blueprint.",
        { title: "Failed to Apply" }
      );
    } finally {
      setApplyingBlueprintMessageId(null);
    }
  };

  const suggestedPrompts = currentTripDestination
    ? [
        {
          label: `Customs Rules for ${currentTripDestination}`,
          prompt: `What are the customs regulations and duty-free limits I should know when returning from ${currentTripDestination}?`,
        },
        {
          label: `Halal Dining in ${currentTripDestination}`,
          prompt: `Can you recommend verified halal-friendly dining spots along my itinerary in ${currentTripDestination}?`,
        },
        {
          label: `Payment Methods in ${currentTripDestination}`,
          prompt: `What are the best payment methods, transit cards, and cross-border QRIS options in ${currentTripDestination}?`,
        },
        {
          label: "Refine Itinerary Schedule",
          prompt: `Help me adjust and optimize this itinerary schedule to be more relaxed and well-paced.`,
        },
      ]
    : SUGGESTED_PROMPTS;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isSending || isSendingRef.current || !isOnline) return;

    // Immediately lock UI synchronously and prevent any duplicate triggers
    isSendingRef.current = true;
    setIsSending(true);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const tempUserMsgId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? `temp_${crypto.randomUUID()}`
        : `temp_${Date.now()}`;
    const tempAiMsgId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? `temp_${crypto.randomUUID()}`
        : `temp_${Date.now() + 1}`;

    let targetConvId = activeConversationId;

    // Immediately display user message and AI thinking skeleton.
    // This instantly unmounts the empty state and suggestion cards!
    const tempUserMsg: ChatMessage = {
      id: tempUserMsgId,
      conversation_id: targetConvId || "temp_conv",
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };

    const tempAiMsg: ChatMessage = {
      id: tempAiMsgId,
      conversation_id: targetConvId || "temp_conv",
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg, tempAiMsg]);
    setIsAtBottom(true);
    requestAnimationFrame(() => scrollToBottom("smooth"));

    if (!targetConvId) {
      try {
        const newConv = await createConversation("New Conversation", currentTripId || undefined);
        setConversations((prev) => [newConv, ...prev]);
        targetConvId = newConv.id;
        setActiveConversationId(newConv.id);
        router.replace(`/chat?id=${newConv.id}`, { scroll: false });
        // Reconcile optimistic messages with real conversation ID
        setMessages((prev) =>
          prev.map((m) =>
            m.conversation_id === "temp_conv" ? { ...m, conversation_id: newConv.id } : m
          )
        );
      } catch (err) {
        console.error("Failed to init conversation:", err);
        isSendingRef.current = false;
        setIsSending(false);
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsgId && m.id !== tempAiMsgId));
        toast.error("Failed to start new conversation. Please try again.");
        return;
      }
    }

    // Optimistically reorder sidebar: bump target conversation to position 0 immediately
    setConversations((prev) => {
      const idx = prev.findIndex((c) => String(c.id) === String(targetConvId));
      if (idx <= 0) return prev;
      const target = {
        ...prev[idx],
        updated_at: new Date().toISOString(),
        message_count: (prev[idx].message_count || 0) + 1,
      };
      const rest = prev.filter((c) => String(c.id) !== String(targetConvId));
      return [target, ...rest];
    });

    let accumulatedText = "";

    try {
      await sendMessageStream(
        targetConvId,
        text,
        (chunk) => {
          accumulatedText += chunk;
          setMessages((prev) =>
            prev.map((m) => (m.id === tempAiMsgId ? { ...m, content: accumulatedText } : m))
          );
        },
        (doneData) => {
          if (doneData.message_id) {
            setMessages((prev) =>
              prev.map((m) => (m.id === tempAiMsgId ? { ...m, id: doneData.message_id } : m))
            );
          }
          if (doneData.user_message_id) {
            const realUserMsgId = doneData.user_message_id;
            setMessages((prev) =>
              prev.map((m) => (m.id === tempUserMsg.id ? { ...m, id: realUserMsgId } : m))
            );
          }
          if (doneData.title) {
            setConversations((prev) =>
              prev.map((c) => (String(c.id) === String(targetConvId) ? { ...c, title: doneData.title || c.title } : c))
            );
          }
        }
      );

      // Reconcile messages with database to guarantee real PostgreSQL IDs for edit & actions
      try {
        const detail = await getConversation(targetConvId);
        if (detail && detail.messages && detail.messages.length > 0) {
          setMessages(detail.messages);
        }
      } catch (syncErr) {
        console.warn("Failed to reconcile messages with DB:", syncErr);
      }

      const updatedList = await listConversations();
      setConversations(updatedList);
    } catch (err: unknown) {
      if (!accumulatedText) {
        const errorMsg = err instanceof Error ? err.message : "Failed to generate response.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempAiMsgId
              ? { ...m, content: `Sorry, I encountered an issue: ${errorMsg}`, is_error: true }
              : m
          )
        );
      }
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  return (
    <div className="flex h-screen h-[100dvh] flex-col overflow-hidden bg-background text-foreground selection:bg-blue-500/20 selection:text-blue-200">
      <Navbar />

      <main className="relative flex-1 min-h-0 flex flex-col px-4 py-8 pb-24 sm:pb-8 sm:px-6 lg:px-8 w-full">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-80 w-full max-w-5xl bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_60%)]" />

        {!isAuthLoading && !isAuthenticated ? (
          <Card className="my-auto mx-auto max-w-5xl w-full relative overflow-hidden rounded-3xl border border-blue-500/20 bg-card/50 p-6 sm:p-12 text-center backdrop-blur-xl animate-in fade-in duration-300">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.1),transparent_70%)]" />
            <div className="relative mx-auto mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-950/40 text-blue-400 shadow-inner">
              <Lock className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <Typography variant="h2" className="font-bold text-white text-lg sm:text-xl">
              Sign In to Access Conversational AI Chat
            </Typography>
            <Typography variant="muted" as="p" className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-zinc-300">
              Plan custom multi-day itineraries and ask verified travel questions with KelanaAI conversational memory.
            </Typography>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/login?redirect=/chat" className="w-full sm:w-auto">
                <Button variant="default" size="sm" className="w-full gap-2 px-6 shadow-md active:scale-95">
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Button>
              </Link>
              <Link href="/register" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full gap-2 px-6 active:scale-95">
                  <span>Create Account</span>
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="relative mx-auto max-w-5xl w-full flex-1 min-h-0 flex rounded-2xl sm:rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-2xl shadow-2xl overflow-hidden">
            
            {/* Mobile Backdrop Overlay */}
            {isSidebarOpen && (
              <div
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 z-40 bg-black/75 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
              />
            )}

            {/* Sidebar (Slide-over Drawer on Mobile, Column on Desktop) */}
            <aside
              className={`${
                isSidebarOpen
                  ? "fixed inset-y-0 left-0 z-50 w-72 max-w-[82vw] md:static md:w-64 lg:w-72 flex shadow-2xl md:shadow-none"
                  : "hidden md:hidden"
              } flex-col border-r border-white/10 bg-zinc-950 md:bg-zinc-950/60 transition-all duration-300 shrink-0`}
            >
              <div className="p-3.5 border-b border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Conversations
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    onClick={handleNewConversation}
                    disabled={isSending}
                    size="sm"
                    variant="default"
                    className="gap-1 h-7 px-2.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Create new conversation thread"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </Button>
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(false)}
                    className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search Conversations Input */}
              {conversations.length > 0 && !isLoadingConversations && (
                <div className="px-2.5 py-2 border-b border-white/5 bg-zinc-950/40">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                    <input
                      type="text"
                      value={searchConvQuery}
                      onChange={(e) => setSearchConvQuery(e.target.value)}
                      placeholder="Search conversations..."
                      className="w-full bg-zinc-900/80 border border-white/10 rounded-lg pl-8 pr-7 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                    {searchConvQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchConvQuery("")}
                        className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 no-scrollbar">
                {isLoadingConversations ? (
                  <SidebarConversationSkeleton />
                ) : conversations.length === 0 ? (
                  <EmptySidebarState onNewChat={handleNewConversation} />
                ) : conversations.filter((c) =>
                    c.title.toLowerCase().includes(searchConvQuery.trim().toLowerCase())
                  ).length === 0 ? (
                  <div className="text-center p-6 text-zinc-500 text-xs">
                    <p>No chats match &ldquo;{searchConvQuery}&rdquo;</p>
                    <button
                      type="button"
                      onClick={() => setSearchConvQuery("")}
                      className="mt-2 text-blue-400 hover:underline text-[11px] font-medium cursor-pointer"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  conversations
                    .filter((c) =>
                      c.title.toLowerCase().includes(searchConvQuery.trim().toLowerCase())
                    )
                    .map((conv) => {
                    const isActive = String(conv.id) === String(activeConversationId);
                    const isEditing = editingConvId === conv.id;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => !isSending && selectConversation(conv.id)}
                        className={`group relative flex items-center justify-between p-2.5 sm:p-2 rounded-xl transition-all border text-xs ${
                          isActive
                            ? "bg-blue-600/15 border-blue-500/40 text-white shadow-sm cursor-pointer"
                            : isSending
                            ? "bg-transparent border-transparent text-zinc-500 cursor-not-allowed opacity-60 pointer-events-none"
                            : "bg-transparent border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1 pr-1.5">
                          <MessageSquare
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-400"
                            }`}
                          />
                          {isEditing ? (
                            <input
                              type="text"
                              value={editTitleInput}
                              onChange={(e) => setEditTitleInput(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveRename(conv.id, e as unknown as React.MouseEvent);
                                if (e.key === "Escape") handleCancelRename(e as unknown as React.MouseEvent);
                              }}
                              autoFocus
                              className="w-full bg-zinc-800 border border-blue-500/50 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                            />
                          ) : (
                            <div className="min-w-0 flex-1 flex flex-col">
                              <span className="truncate font-medium text-xs">{conv.title}</span>
                              <span className="text-[10px] text-zinc-500 font-normal sm:hidden block mt-0.5">
                                {formatSidebarTimestamp(conv.updated_at || conv.created_at)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={(e) => handleSaveRename(conv.id, e)}
                                title="Save title"
                                className="p-1 hover:text-emerald-400 rounded transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelRename}
                                title="Cancel rename"
                                className="p-1 hover:text-rose-400 rounded transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Adaptive Timestamp (Desktop unhovered state) */}
                              <span className="hidden sm:inline sm:group-hover:hidden text-[10px] text-zinc-500 font-normal whitespace-nowrap pl-1">
                                {formatSidebarTimestamp(conv.updated_at || conv.created_at)}
                              </span>

                              {/* Action buttons (revealed on desktop hover, always accessible on mobile) */}
                              <div className="flex items-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={(e) => handleStartRename(conv, e)}
                                  disabled={isSending}
                                  title="Rename conversation"
                                  className="p-1 hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleOpenDeleteDialog(conv.id, e)}
                                  disabled={isSending}
                                  title="Delete conversation"
                                  className="p-1 hover:text-rose-400 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {/* Bottom Quick Navigation Links (Instant Jump across Routes) */}
              <div className="p-2.5 border-t border-white/10 bg-zinc-950/80 shrink-0">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-1 block mb-1.5">
                  App Navigation
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    href="/"
                    className="flex items-center justify-center gap-2 py-2 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all text-xs font-medium active:scale-95 group"
                  >
                    <Compass className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span>Trip Planner</span>
                  </Link>
                  <Link
                    href="/trips"
                    className="flex items-center justify-center gap-2 py-2 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all text-xs font-medium active:scale-95 group"
                  >
                    <Map className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>My Trips</span>
                  </Link>
                </div>
              </div>
            </aside>

            {/* Right Chat Panel */}
            <div className="relative flex-1 min-h-0 flex flex-col min-w-0 bg-zinc-900/30">
              {/* Header */}
              <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-b border-white/10 bg-zinc-950/40 flex items-center justify-between gap-2.5 shrink-0">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
                    className="p-1.5 rounded-lg border border-white/10 bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 transition-all active:scale-95"
                  >
                    <Menu className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  </button>

                  <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-400 shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  </div>

                  <div className="min-w-0">
                    <Typography as="h1" className="text-xs sm:text-sm font-bold text-white truncate tracking-tight">
                      {activeConversation ? activeConversation.title : "Travel Assistant"}
                    </Typography>
                    <p className="text-[10px] text-zinc-400 hidden sm:flex items-center gap-1.5 truncate">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                      Dynamic Intent Routing & RAG Active
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Mobile Quick Wayfinding (Exit chat to Planner or Trips) */}
                  <Link
                    href="/"
                    className={`flex sm:hidden items-center justify-center p-1.5 rounded-lg border border-white/10 bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 hover:text-white transition-all active:scale-95 ${
                      isSending ? "pointer-events-none opacity-40 cursor-not-allowed" : ""
                    }`}
                    title="Back to Trip Planner"
                  >
                    <Compass className="w-3.5 h-3.5 text-blue-400" />
                  </Link>
                  <Link
                    href="/trips"
                    className={`flex sm:hidden items-center justify-center p-1.5 rounded-lg border border-white/10 bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 hover:text-white transition-all active:scale-95 ${
                      isSending ? "pointer-events-none opacity-40 cursor-not-allowed" : ""
                    }`}
                    title="My Trips"
                  >
                    <Map className="w-3.5 h-3.5 text-emerald-400" />
                  </Link>

                  <Button
                    onClick={handleNewConversation}
                    disabled={isSending}
                    size="sm"
                    variant="outline"
                    className="gap-1.5 h-7 px-2 sm:px-2.5 text-xs rounded-lg border-white/10 hover:bg-white/5 active:scale-95 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">New Chat</span>
                  </Button>
                </div>
              </div>

              {/* Linked Trip Context Banner (Model 3 Bridge) */}
              <LinkedTripBanner destination={currentTripDestination} tripId={currentTripId} />

              {/* Messages Scroll Area */}
              <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-4 space-y-3.5 sm:space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent hover:scrollbar-thumb-zinc-700"
              >
                {isLoadingMessages ? (
                  <MessageThreadSkeleton />
                ) : messages.length === 0 ? (
                  <SuggestedPromptsGrid
                    prompts={suggestedPrompts}
                    onSelectPrompt={handleSendMessage}
                    disabled={isSending}
                  />
                ) : (
                  messages.map((msg, idx) => {
                    const isUser = msg.role === "user";
                    const isLastMessage = idx === messages.length - 1;
                    const isEditingThis = editingMessageId === msg.id;
                    const isCopied = copiedMessageId === msg.id;

                    const prevMsg = idx > 0 ? messages[idx - 1] : null;
                    const showDateDivider =
                      idx === 0 ||
                      Boolean(
                        prevMsg &&
                          new Date(msg.created_at).toDateString() !==
                            new Date(prevMsg.created_at).toDateString()
                      );

                    // When an assistant message is regenerating or awaiting streaming output,
                    // replace the message directly with ThinkingMessageSkeleton!
                    const isTargetRegenerating =
                      !isUser &&
                      ((regeneratingMessageId && String(msg.id) === String(regeneratingMessageId)) ||
                        (isRegenerating && isLastMessage) ||
                        (!msg.content && (isSending || isRegenerating)));

                    if (isTargetRegenerating) {
                      return (
                        <div key={msg.id} className="space-y-3.5 sm:space-y-4">
                          {showDateDivider && (
                            <div className="flex items-center justify-center my-3 sm:my-4">
                              <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-zinc-900/90 px-3 py-1 shadow-sm backdrop-blur-md">
                                <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400">
                                  {formatDateDivider(msg.created_at)}
                                </span>
                              </div>
                            </div>
                          )}
                          <ThinkingMessageSkeleton />
                        </div>
                      );
                    }

                    return (
                      <ChatMessageItem
                        key={msg.id}
                        msg={msg}
                        idx={idx}
                        totalMessages={messages.length}
                        showDateDivider={showDateDivider}
                        isEditingThis={isEditingThis}
                        editMessageInput={editMessageInput}
                        isSubmittingEdit={isSubmittingEdit}
                        isSending={isSending}
                        isCopied={isCopied}
                        isRegenerating={isRegenerating}
                        isLastMessage={isLastMessage}
                        currentTripId={currentTripId}
                        isSaved={savedMessageIds.has(msg.id)}
                        isApplyingBlueprint={applyingBlueprintMessageId === msg.id}
                        onStartEditMessage={handleStartEditMessage}
                        onCancelEditMessage={handleCancelEditMessage}
                        onSaveEditMessage={handleSaveEditMessage}
                        onEditInputChange={setEditMessageInput}
                        onCopyMessage={handleCopyMessage}
                        onRegenerateResponse={handleRegenerateResponse}
                        onApplyToBlueprint={handleApplyToBlueprint}
                        onOpenSaveTrip={handleOpenSaveTrip}
                        onNavigateToTrip={handleNavigateToTrip}
                      />
                    );
                  })
                )}

                {/* Fallback ThinkingMessageSkeleton: only when the latest message in list is a user turn */}
                {isSending && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
                  <ThinkingMessageSkeleton />
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Floating Scroll to Bottom Button */}
              {!isAtBottom && messages.length > 0 && !isLoadingMessages && (
                <div className="absolute bottom-20 right-4 sm:right-6 z-20 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      scrollToBottom("smooth");
                      setIsAtBottom(true);
                    }}
                    className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/15 shadow-xl shadow-black/70 backdrop-blur-md text-xs font-medium transition-all active:scale-95 group"
                    aria-label="Scroll to latest message"
                    title="Scroll to latest message"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-blue-400 group-hover:translate-y-0.5 transition-transform" />
                    <span className="text-[11px] font-semibold">Latest</span>
                  </button>
                </div>
              )}

              {/* Chat Input Box: Pinned & Optimized for Mobile Viewport */}
              <ChatInputArea
                input={input}
                isSending={isSending}
                isOnline={isOnline}
                textareaRef={textareaRef}
                onInputChange={setInput}
                onKeyDown={handleKeyDown}
                onSubmit={handleSendMessage}
              />
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Dialog: Delete Conversation Thread */}
      <ConfirmDialog
        isOpen={convToDelete !== null}
        onClose={() => setConvToDelete(null)}
        onConfirm={handleConfirmDeleteConversation}
        isLoading={isDeletingConv}
        title="Delete Conversation Thread?"
        description="Are you sure you want to delete this conversation thread? All messages and travel recommendations in this discussion will be permanently erased."
        confirmText="Yes, Delete Thread"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* Save Chat Itinerary to My Trips Modal */}
      <SaveChatTripModal
        isOpen={saveTripModalOpen}
        onClose={() => setSaveTripModalOpen(false)}
        rawItineraryText={tripToSaveText}
        userPrompt={tripToSaveUserPrompt}
        conversationTitle={activeConversation?.title}
        defaultDestination={activeConversation?.title}
        defaultStyle={user?.default_travel_style || "Family"}
        onSaved={handleTripSaved}
      />
    </div>
  );
}

/**
 * Interactive multi-turn AI travel chat page, wrapped in Suspense for search parameter hydration.
 */
export default function ChatPage() {
  return (
    <Suspense fallback={<ChatPageSkeleton />}>
      <ChatContent />
    </Suspense>
  );
}
