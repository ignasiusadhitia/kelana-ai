"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { askAssistant } from "@/services/assistantService";
import { useAuth } from "@/hooks/useAuth";
import { Send, FileText, Bot, User, Trash2, HelpCircle, Loader2, Lock, LogIn } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  source?: string | null;
  sources?: string[];
  timestamp: string;
}

const QUICK_TOPICS = [
  "Berapa batas pembebasan bea cukai dan aturan IMEI handphone?",
  "Cara cek makanan halal dan bebas mirin/pork di minimarket Jepang?",
  "Negara mana saja yang bisa bayar pakai QRIS antarnegara?",
  "Do Indonesian passport holders need a visa to visit Japan?",
  "Can I bring medication into Japan?",
  "What baggage allowance does Sinaptik Travel provide?",
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-1",
    sender: "assistant",
    text: "Hello! I am your KelanaAI Travel Knowledge Assistant. Ask me anything about visa policies, travel insurance, medication rules, or destination guidelines.",
    timestamp: "Just now",
  },
];

export default function AssistantPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState<string>(() => "session-" + Math.random().toString(36).substring(2, 11));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login?redirect=/assistant");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const processResponseSources = (data: import("@/services/assistantService").AssistantResponse): string[] => {
    const allSources: string[] = [];
    const extractSourceName = (src: import("@/services/assistantService").SourceObject): string =>
      src.metadata?._document_title ||
      (src.location?.s3Location?.uri ? src.location.s3Location.uri.split("/").pop()! : null) ||
      (src.document_id ? src.document_id.split("/").pop()! : null) ||
      "Knowledge Base Document";

    if (Array.isArray(data.source)) {
      for (const s of data.source) {
        const name = extractSourceName(s);
        if (name && !allSources.includes(name)) allSources.push(name);
      }
    } else if (typeof data.source === "string" && data.source) {
      const name = data.source.split("/").pop() || data.source;
      if (!allSources.includes(name)) allSources.push(name);
    }

    for (const c of data.citations ?? []) {
      if (c.source) {
        const name = c.source.split("/").pop() || c.source;
        if (!allSources.includes(name)) allSources.push(name);
      }
    }
    return allSources;
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await askAssistant(query, sessionId);
      const allSources = processResponseSources(data);

      const assistantMsg: ChatMessage = {
        id: "assistant-" + Date.now(),
        sender: "assistant",
        text: data.answer,
        sources: allSources.length > 0 ? allSources : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to retrieve information.";
      const assistantMsg: ChatMessage = {
        id: "error-" + Date.now(),
        sender: "assistant",
        text: `Sorry, I encountered an issue: ${errorMsg}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-blue-500/20 selection:text-blue-200">
      <Navbar />

      <main className="flex-1 flex flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Unauthenticated State View */}
        {!isAuthLoading && !isAuthenticated ? (
          <Card className="my-auto relative overflow-hidden rounded-3xl border border-blue-500/20 bg-card/50 p-8 sm:p-12 text-center backdrop-blur-xl animate-in fade-in duration-300">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.1),transparent_70%)]" />
            <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-950/40 text-blue-400 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <Typography variant="h2" className="font-bold text-white text-xl">
              Sign In to Access Travel Assistant
            </Typography>
            <Typography variant="muted" as="p" className="mx-auto mt-2 max-w-md text-sm text-zinc-300">
              Consult verified visa rules, travel regulations, and document checklists with KelanaAI.
            </Typography>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/login?redirect=/assistant">
                <Button variant="default" size="sm" className="gap-2 px-6 shadow-md active:scale-95">
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="sm" className="gap-2 px-6 active:scale-95">
                  <span>Create Account</span>
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          /* Chat Container Card with Glassmorphic styling matching KelanaAI Design */
          <div className="flex-1 flex flex-col rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-2xl shadow-2xl overflow-hidden min-h-[620px]">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-zinc-950/40">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-400">
                <Bot className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              </div>
              <div>
                <Typography as="h1" className="text-sm font-bold text-white tracking-tight">
                  Travel Knowledge Assistant
                </Typography>
                <p className="text-[11px] text-zinc-400">
                  Verified answers from official guidelines & policies
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearChat}
              title="Reset conversation"
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-all text-xs flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Clear</span>
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-sm animate-in fade-in slide-in-from-bottom-1 duration-200 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-md ${
                        isUser
                          ? "bg-blue-600 text-white rounded-br-xs"
                          : "bg-zinc-950/75 border border-white/10 text-zinc-200 rounded-bl-xs"
                      }`}
                    >
                      {isUser ? (
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <div className="prose prose-invert prose-sm max-w-none">
                          <MarkdownRenderer content={msg.text} />
                        </div>
                      )}
                    </div>

                    {/* Source citation badge */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 px-1 text-[11px] text-zinc-400">
                        <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{msg.sources.length > 1 ? "Sources:" : "Source:"}</span>
                        {msg.sources.map((src, i) => (
                          <code
                            key={i}
                            className="rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 font-mono text-[11px] font-medium text-blue-300"
                          >
                            {src}
                          </code>
                        ))}
                      </div>
                    )}

                    <span className="mt-1 px-1 text-[10px] text-zinc-500">
                      {msg.timestamp}
                    </span>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-white/10 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 text-sm items-center animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="rounded-2xl rounded-bl-xs bg-zinc-950/75 border border-white/10 px-4 py-3 text-zinc-400 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span className="text-xs">Searching documents & generating verified answer...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Carousel / Chips */}
          <div className="px-4 py-2.5 border-t border-white/5 bg-zinc-950/20">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-[11px] font-medium text-zinc-400 shrink-0 flex items-center gap-1 pl-1">
                <HelpCircle className="w-3 h-3 text-blue-400" />
                Topics:
              </span>
              {QUICK_TOPICS.map((topic, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(topic)}
                  disabled={loading}
                  className="shrink-0 text-xs text-zinc-300 bg-zinc-800/60 hover:bg-blue-600/20 hover:text-blue-300 hover:border-blue-500/40 border border-white/5 rounded-full px-3 py-1 transition-all"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Input Chat Box */}
          <div className="p-3 sm:p-4 border-t border-white/10 bg-zinc-950/40">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-end gap-2 bg-zinc-950/80 border border-white/10 rounded-2xl p-1.5 focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-inner"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about visas, baggage allowance, travel rules... (Enter to send)"
                rows={1}
                disabled={loading}
                className="w-full resize-none bg-transparent px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none max-h-32 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white shadow-md hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0 active:scale-95"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
