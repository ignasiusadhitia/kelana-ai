"use client";

/**
 * PAGE: /chat (Multi-Turn AI Travel Chat)
 * Interactive conversational travel planner with multi-turn context and thread management.
 */

import { useState, useRef, useEffect, Suspense } from "react";
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
  Loader2,
  Lock,
  LogIn,
  Sparkles,
  Menu,
  Clock,
  Compass,
  FileText,
  Map,
  Home,
  Search,
  BookmarkPlus,
  BookmarkCheck,
  ChevronDown,
  WifiOff,
  ArrowUpRight,
} from "lucide-react";
import {
  SidebarConversationSkeleton,
  MessageThreadSkeleton,
  ThinkingMessageSkeleton,
  EmptySidebarState,
} from "@/components/chat/ChatSkeletons";
import { SaveChatTripModal } from "@/components/chat/SaveChatTripModal";

const SUGGESTED_PROMPTS = [
  { label: "Family Trip in Japan", prompt: "Plan a 5-day family trip to Japan with kids." },
  { label: "Customs Duty-Free Limits", prompt: "What are the duty-free limits for alcohol and electronics under Japan customs?" },
  { label: "Halal Food in Tokyo", prompt: "How to verify Halal food in Tokyo convenience stores?" },
  { label: "QRIS Payment in Japan", prompt: "Can I use Indonesian QRIS in Japan?" },
];

function parseMessageContentAndSources(rawContent: string): { text: string; sources: string[] } {
  if (!rawContent) return { text: "", sources: [] };
  const sources: string[] = [];

  // Match [Source: filename.md] or [Source: file1.md, file2.pdf]
  const bracketRegex = /\[Source:\s*([^\]]+)\]/gi;
  let match: RegExpExecArray | null;
  while ((match = bracketRegex.exec(rawContent)) !== null) {
    const raw = match[1]?.trim().replace(/[*_`]/g, "");
    if (raw && raw.toLowerCase() !== "n/a") {
      // Split by comma or semicolons if multiple sources are listed
      const parts = raw.split(/[,;]/);
      for (const p of parts) {
        const filename = p.split("/").pop()?.trim();
        if (filename && !sources.includes(filename)) {
          sources.push(filename);
        }
      }
    }
  }

  // Also match plain "Source: filename.md" or "Source: filename.pdf"
  const plainRegex = /(?:^|\n)\s*Source:\s*([a-zA-Z0-9_\-.]+\.(?:pdf|md|txt))/gi;
  while ((match = plainRegex.exec(rawContent)) !== null) {
    const filename = match[1]?.trim();
    if (filename && !sources.includes(filename)) {
      sources.push(filename);
    }
  }

  // Strip citation tags from displayed markdown text
  const cleanText = rawContent
    .replace(/\[Source:\s*[^\]]+\]/gi, "")
    .replace(/(?:^|\n)\s*Source:\s*[a-zA-Z0-9_\-.]+\.(?:pdf|md|txt)/gi, "")
    .trim();

  return { text: cleanText || rawContent, sources };
}

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

  // Search filter for sidebar conversations
  const [searchConvQuery, setSearchConvQuery] = useState("");

  // Save chat as trip / Apply to Blueprint states
  const [saveTripModalOpen, setSaveTripModalOpen] = useState(false);
  const [tripToSaveText, setTripToSaveText] = useState("");
  const [tripToSaveMessageId, setTripToSaveMessageId] = useState<string | number | null>(null);
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

  const handleCopyMessage = async (id: string | number, text: string) => {
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
  };

  const handleStartEditMessage = (msg: ChatMessage) => {
    if (isSending || isSubmittingEdit || isRegenerating) return;
    setEditingMessageId(msg.id);
    setEditMessageInput(msg.content);
  };

  const handleCancelEditMessage = () => {
    setEditingMessageId(null);
    setEditMessageInput("");
  };

  const handleSaveEditMessage = async (msgId: string | number) => {
    if (!activeConversationId || isSending || isSubmittingEdit) return;
    const text = editMessageInput.trim();
    if (!text) return;

    setIsSubmittingEdit(true);
    setIsSending(true);
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
      setEditingMessageId(null);
      setEditMessageInput("");
      toast.success("Message edited and discussion updated.", { title: "Turn Updated" });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update message.",
        { title: "Edit Failed" }
      );
      console.error("Failed to edit message:", err);
    } finally {
      setIsSubmittingEdit(false);
      setIsSending(false);
    }
  };

  const handleRegenerateResponse = async () => {
    if (!activeConversationId || isSending || isRegenerating) return;

    setIsRegenerating(true);
    setIsSending(true);
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
    } finally {
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
      await updateTripRecommendation(currentTripId, aiText);
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
    if (!text || isSending || !isOnline) return;

    let targetConvId = activeConversationId;

    if (!targetConvId) {
      try {
        const newConv = await createConversation("New Conversation", currentTripId || undefined);
        setConversations((prev) => [newConv, ...prev]);
        targetConvId = newConv.id;
        setActiveConversationId(newConv.id);
        router.replace(`/chat?id=${newConv.id}`, { scroll: false });
      } catch (err) {
        console.error("Failed to init conversation:", err);
        return;
      }
    }

    const tempUserMsgId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? `temp_${crypto.randomUUID()}`
        : `temp_${Date.now()}`;
    const tempAiMsgId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? `temp_${crypto.randomUUID()}`
        : `temp_${Date.now() + 1}`;

    const tempUserMsg: ChatMessage = {
      id: tempUserMsgId,
      conversation_id: targetConvId,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };

    const tempAiMsg: ChatMessage = {
      id: tempAiMsgId,
      conversation_id: targetConvId,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg, tempAiMsg]);

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

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsAtBottom(true);
    requestAnimationFrame(() => scrollToBottom("smooth"));
    setIsSending(true);

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
              ? { ...m, content: `Sorry, I encountered an issue: ${errorMsg}` }
              : m
          )
        );
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const formatFullDateTooltip = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  const formatDateDivider = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();

      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();

      if (isToday) return "Today";
      if (isYesterday) return "Yesterday";

      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } catch {
      return "";
    }
  };

  const formatSidebarTimestamp = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      const now = new Date();

      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      if (isToday) {
        return date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();

      if (isYesterday) {
        return "Yesterday";
      }

      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 7 && diffDays >= 0) {
        return date.toLocaleDateString("en-US", { weekday: "short" });
      }

      if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
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
                            ? "bg-transparent border-transparent text-zinc-500 cursor-not-allowed opacity-60"
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
                    className="flex sm:hidden items-center justify-center p-1.5 rounded-lg border border-white/10 bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 hover:text-white transition-all active:scale-95"
                    title="Back to Trip Planner"
                  >
                    <Compass className="w-3.5 h-3.5 text-blue-400" />
                  </Link>
                  <Link
                    href="/trips"
                    className="flex sm:hidden items-center justify-center p-1.5 rounded-lg border border-white/10 bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 hover:text-white transition-all active:scale-95"
                    title="My Trips"
                  >
                    <Map className="w-3.5 h-3.5 text-emerald-400" />
                  </Link>

                  <Button
                    onClick={handleNewConversation}
                    size="sm"
                    variant="outline"
                    className="gap-1.5 h-7 px-2 sm:px-2.5 text-xs rounded-lg border-white/10 hover:bg-white/5 active:scale-95 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">New Chat</span>
                  </Button>
                </div>
              </div>

              {/* Linked Trip Context Banner (Model 3 Bridge) */}
              {currentTripDestination && (
                <div className="px-3 sm:px-5 py-2 border-b border-amber-500/20 bg-amber-950/20 flex items-center justify-between gap-2 shrink-0 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <Map className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[11px] text-amber-300 font-medium truncate">
                      Linked Trip: <span className="font-bold text-amber-200">{currentTripDestination}</span>
                    </span>
                  </div>
                  {currentTripId && (
                    <Link
                      href={`/trips/${currentTripId}`}
                      className="text-[10px] text-amber-400 hover:text-amber-300 underline-offset-2 hover:underline shrink-0 flex items-center gap-1 active:scale-95"
                    >
                      <span>Open Blueprint</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              )}

              {/* Messages Scroll Area */}
              <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-4 space-y-3.5 sm:space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent hover:scrollbar-thumb-zinc-700"
              >
                {isLoadingMessages ? (
                  <MessageThreadSkeleton />
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-3 sm:p-4 max-w-2xl mx-auto my-auto">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-2 shadow-inner">
                      <Compass className="w-5 h-5" />
                    </div>
                    <Typography variant="h3" className="text-sm sm:text-base font-bold text-white">
                      Start Your Travel Conversation
                    </Typography>
                    <p className="text-[11px] text-zinc-400 mt-0.5 mb-3 sm:mb-4 max-w-md">
                      Plan itineraries or ask verified travel policy questions (Customs, Halal dining, QRIS).
                    </p>

                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-left">
                      {suggestedPrompts.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(item.prompt)}
                          disabled={isSending}
                          className="text-left text-xs text-zinc-300 bg-zinc-950/60 hover:bg-blue-600/20 hover:text-blue-200 hover:border-blue-500/40 border border-white/10 rounded-xl p-2.5 transition-all flex items-center justify-between group shadow-sm active:scale-98"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-semibold text-white block text-[11px] group-hover:text-blue-300 truncate">
                              {item.label}
                            </span>
                            <span className="text-[10px] text-zinc-400 line-clamp-1">
                              {item.prompt}
                            </span>
                          </div>
                          <Send className="w-3 h-3 text-zinc-500 group-hover:text-blue-400 transition-colors shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isUser = msg.role === "user";
                    if (!isUser && !msg.content) return null;
                    const isLastMessage = idx === messages.length - 1;
                    const isEditingThis = editingMessageId === msg.id;
                    const isCopied = copiedMessageId === msg.id;
                    const { text: cleanText, sources } = isUser
                      ? { text: msg.content, sources: [] }
                      : parseMessageContentAndSources(msg.content);

                    const prevMsg = idx > 0 ? messages[idx - 1] : null;
                    const showDateDivider =
                      idx === 0 ||
                      Boolean(
                        prevMsg &&
                          new Date(msg.created_at).toDateString() !==
                            new Date(prevMsg.created_at).toDateString()
                      );

                    return (
                      <div key={msg.id} className="space-y-3.5 sm:space-y-4">
                        {/* Centered Date Divider Pill between calendar days */}
                        {showDateDivider && (
                          <div className="flex items-center justify-center my-3 sm:my-4">
                            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-zinc-900/90 px-3 py-1 shadow-sm backdrop-blur-md">
                              <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400">
                                {formatDateDivider(msg.created_at)}
                              </span>
                            </div>
                          </div>
                        )}

                        <div
                          className={`group/msg flex gap-2 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-1 duration-200 ${
                            isUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          {!isUser && (
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                              <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </div>
                          )}

                          <div className={`max-w-[88%] sm:max-w-[78%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                            {/* Message bubble OR inline editor */}
                            {isEditingThis ? (
                              <div className="w-full flex flex-col gap-2">
                                {/* Truncation notice if editing older message */}
                                {idx < messages.length - 2 && (
                                  <p className="text-[10px] text-amber-400/80 flex items-center gap-1 px-1">
                                    <span>⚠</span>
                                    Subsequent messages will be cleared and regenerated from here.
                                  </p>
                                )}
                                <textarea
                                  autoFocus
                                  value={editMessageInput}
                                  onChange={(e) => setEditMessageInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Escape") handleCancelEditMessage();
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSaveEditMessage(msg.id);
                                    }
                                  }}
                                  disabled={isSubmittingEdit}
                                  rows={3}
                                  className="w-full min-w-[260px] sm:min-w-[340px] bg-zinc-900/80 border border-blue-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-400/70 resize-none disabled:opacity-60"
                                />
                                <div className="flex items-center gap-1.5 justify-end">
                                  <button
                                    type="button"
                                    onClick={handleCancelEditMessage}
                                    className="px-2.5 py-1 rounded-lg text-[10px] text-zinc-400 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEditMessage(msg.id)}
                                    disabled={isSubmittingEdit || !editMessageInput.trim()}
                                    className="px-2.5 py-1 rounded-lg text-[10px] bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                  >
                                    {isSubmittingEdit ? (
                                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                    ) : (
                                      <Send className="w-2.5 h-2.5" />
                                    )}
                                    Save & Submit
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Message content bubble */}
                                <div
                                  className={`group/bubble relative rounded-2xl px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-md ${
                                    isUser
                                      ? "bg-blue-600 text-white rounded-br-xs"
                                      : "bg-zinc-950/75 border border-white/10 text-zinc-200 rounded-bl-xs"
                                  }`}
                                >
                                  {isUser ? (
                                    <p className="leading-relaxed whitespace-pre-wrap">{cleanText}</p>
                                  ) : (
                                    <div className="prose prose-invert prose-xs sm:prose-sm max-w-none break-words">
                                      <MarkdownRenderer content={cleanText} />
                                    </div>
                                  )}

                                  {/* User message hover actions: Copy & Edit */}
                                  {isUser && !isSending && (
                                    <div className="absolute -left-16 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                                      <Tooltip content="Copy" side="top">
                                        <button
                                          type="button"
                                          onClick={() => handleCopyMessage(msg.id, cleanText)}
                                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/10 transition-colors"
                                        >
                                          {isCopied ? (
                                            <Check className="w-3 h-3 text-emerald-400" />
                                          ) : (
                                            <Copy className="w-3 h-3" />
                                          )}
                                        </button>
                                      </Tooltip>
                                      <Tooltip content="Edit" side="top">
                                        <button
                                          type="button"
                                          onClick={() => handleStartEditMessage(msg)}
                                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/10 transition-colors"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                      </Tooltip>
                                    </div>
                                  )}
                                </div>

                                {/* Source citation badge */}
                                {!isUser && sources.length > 0 && (
                                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 px-1 text-[10px] text-zinc-400">
                                    <FileText className="w-3 h-3 text-blue-400 shrink-0" />
                                    <span>{sources.length > 1 ? "Sources:" : "Source:"}</span>
                                    {sources.map((src, i) => (
                                      <code
                                        key={i}
                                        className="rounded bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 font-mono text-[10px] font-medium text-blue-300"
                                      >
                                        {src}
                                      </code>
                                    ))}
                                  </div>
                                )}

                                {/* Bottom action row: timestamp + Copy + (Regenerate on last AI turn) */}
                                <div className={`mt-1 flex items-center gap-1.5 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                                  <Tooltip content={formatFullDateTooltip(msg.created_at)} side="top">
                                    <span className="text-[9px] text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 cursor-default select-none">
                                      <Clock className="w-2.5 h-2.5" />
                                      {formatTimestamp(msg.created_at)}
                                    </span>
                                  </Tooltip>

                                  {/* Copy button — all messages, mobile-always-visible, desktop-fade-in on hover */}
                                  <Tooltip content={isCopied ? "Copied!" : "Copy message"} side="top">
                                    <button
                                      type="button"
                                      onClick={() => handleCopyMessage(msg.id, cleanText)}
                                      aria-label="Copy message"
                                      className={`p-1 rounded-md transition-all ${
                                        isCopied
                                          ? "text-emerald-400 opacity-100"
                                          : "text-zinc-500 hover:text-zinc-200 hover:bg-white/10 sm:opacity-0 sm:group-hover/msg:opacity-100 focus:opacity-100"
                                      }`}
                                    >
                                      {isCopied ? (
                                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-2.5 h-2.5" />
                                      )}
                                    </button>
                                  </Tooltip>

                                  {/* Edit button for user messages on mobile */}
                                  {isUser && (
                                    <Tooltip content="Edit" side="top">
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditMessage(msg)}
                                        disabled={isSending}
                                        className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors sm:hidden disabled:opacity-40 disabled:cursor-not-allowed"
                                      >
                                        <Edit2 className="w-2.5 h-2.5" />
                                      </button>
                                    </Tooltip>
                                  )}

                                  {/* Regenerate — latest assistant turn only */}
                                  {!isUser && isLastMessage && (
                                    <Tooltip content="Regenerate response" side="top">
                                      <button
                                        type="button"
                                        onClick={handleRegenerateResponse}
                                        disabled={isSending || isRegenerating}
                                        className="p-1 rounded-md text-zinc-500 hover:text-blue-400 hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed sm:opacity-0 sm:group-hover/msg:opacity-100 focus:opacity-100"
                                      >
                                        <RotateCw className={`w-2.5 h-2.5 ${isRegenerating ? "animate-spin text-blue-400" : ""}`} />
                                      </button>
                                    </Tooltip>
                                  )}

                                  {/* Save as Trip button for assistant messages containing itineraries */}
                                  {!isUser &&
                                    (cleanText.includes("Day 1") ||
                                      cleanText.includes("## Day") ||
                                      cleanText.toLowerCase().includes("itinerary") ||
                                      cleanText.toLowerCase().includes("jadwal") ||
                                      cleanText.toLowerCase().includes("hari 1")) && (
                                    savedMessageIds.has(msg.id) ? (
                                      <Tooltip
                                        content={
                                          currentTripId
                                            ? "Applied to linked Blueprint (Click to view)"
                                            : "Already saved to My Trips (Click to view)"
                                        }
                                        side="top"
                                      >
                                        <button
                                          type="button"
                                          onClick={() =>
                                            router.push(currentTripId ? `/trips/${currentTripId}` : "/trips")
                                          }
                                          className="cursor-pointer inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-blue-300 hover:text-blue-200 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 transition-all active:scale-95 ml-1"
                                        >
                                          <BookmarkCheck className="w-2.5 h-2.5 text-blue-400" />
                                          <span className="hidden sm:inline">Saved</span>
                                        </button>
                                      </Tooltip>
                                    ) : currentTripId ? (
                                      /* Kasus A: Linked Chat -> Apply to Blueprint */
                                      <Tooltip
                                        content={
                                          /(?:^|\n)##\s+Day/i.test(cleanText) ||
                                          /(?:^|\n)\*\*(?:Day|Hari)\s+\d+/i.test(cleanText)
                                            ? "Apply this itinerary update to your linked Blueprint"
                                            : "Apply to Blueprint (Note: message doesn't have standard ## Day headings)"
                                        }
                                        side="top"
                                      >
                                        <button
                                          type="button"
                                          onClick={() => handleApplyToBlueprint(cleanText, msg.id)}
                                          disabled={applyingBlueprintMessageId === msg.id}
                                          className="cursor-pointer inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition-all active:scale-95 ml-1 disabled:opacity-50"
                                        >
                                          {applyingBlueprintMessageId === msg.id ? (
                                            <>
                                              <Loader2 className="w-2.5 h-2.5 animate-spin text-amber-400" />
                                              <span className="hidden sm:inline">Applying...</span>
                                            </>
                                          ) : (
                                            <>
                                              <Sparkles className="w-2.5 h-2.5" />
                                              <span className="hidden sm:inline">Apply to Blueprint</span>
                                            </>
                                          )}
                                        </button>
                                      </Tooltip>
                                    ) : (
                                      /* Kasus B: Standalone Chat -> Save as Official Trip */
                                      <Tooltip
                                        content={
                                          /(?:^|\n)##\s+Day/i.test(cleanText) ||
                                          /(?:^|\n)\*\*(?:Day|Hari)\s+\d+/i.test(cleanText)
                                            ? "Save this itinerary as an official Trip Blueprint"
                                            : "Save as official Trip (Day-by-Day formatting recommended)"
                                        }
                                        side="top"
                                      >
                                        <button
                                          type="button"
                                          onClick={() => handleOpenSaveTrip(cleanText, msg.id)}
                                          className="cursor-pointer inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-all active:scale-95 ml-1"
                                        >
                                          <BookmarkPlus className="w-2.5 h-2.5" />
                                          <span className="hidden sm:inline">Save as Official Trip</span>
                                        </button>
                                      </Tooltip>
                                    )
                                  )}
                                </div>
                              </>
                            )}
                          </div>

                          {isUser && (
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-zinc-800 border border-white/10 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                              <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {isSending && !isRegenerating && messages.length > 0 && !messages[messages.length - 1].content && (
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
              <div className="p-3 sm:p-4 border-t border-white/10 bg-zinc-950/60 shrink-0 pb-safe sm:pb-4">
                {/* Offline Warning Banner */}
                {!isOnline && (
                  <div className="mb-2 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs animate-in fade-in select-none">
                    <WifiOff className="w-3.5 h-3.5 shrink-0" />
                    <span>You are currently offline. Check your internet connection.</span>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="relative flex items-end gap-1.5 sm:gap-2 bg-zinc-950/80 border border-white/10 rounded-xl p-1.5 focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-inner"
                >
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      !isOnline
                        ? "Offline - waiting for connection..."
                        : "Ask about itineraries, day-by-day plans, local tips, customs... (Enter to send)"
                    }
                    rows={1}
                    disabled={isSending || !isOnline}
                    className="w-full resize-none bg-transparent px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none max-h-32 disabled:opacity-50 transition-[height] duration-75 overflow-y-auto"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !input.trim() || !isOnline}
                    aria-label="Send message"
                    className="inline-flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0 active:scale-95"
                  >
                    {isSending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </form>
              </div>
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
        defaultDestination={activeConversation?.title}
        defaultStyle={user?.default_travel_style || "Family"}
        onSaved={handleTripSaved}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
