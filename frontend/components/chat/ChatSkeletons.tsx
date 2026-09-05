"use client";

import React from "react";
import { Bot, Sparkles, MessageSquareDashed, Plus } from "lucide-react";
import { Navbar } from "@/components/Navbar";

/**
 * COMPONENT: ChatSkeletons
 * Shimmering loading placeholders and empty state fallbacks for the AI chat interface.
 */

/**
 * COMPONENT: SidebarConversationSkeleton
 * Shimmering skeleton rows for conversation history list in the chat sidebar.
 */
export function SidebarConversationSkeleton() {
  return (
    <div className="space-y-1.5 p-1 animate-pulse" aria-label="Loading conversations">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between p-2.5 sm:p-2 rounded-xl border border-white/5 bg-zinc-900/40"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-6 h-6 rounded-lg bg-zinc-800 shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div
                className="h-3 rounded bg-zinc-800"
                style={{ width: i % 2 === 0 ? "70%" : "85%" }}
              />
              <div className="h-2 w-1/3 rounded bg-zinc-800/50" />
            </div>
          </div>
          <div className="h-2.5 w-8 rounded bg-zinc-800/40 shrink-0 ml-2" />
        </div>
      ))}
    </div>
  );
}

/**
 * COMPONENT: MessageThreadSkeleton
 * Multi-turn simulated conversation thread skeleton displayed when switching chat threads.
 */
export function MessageThreadSkeleton() {
  return (
    <div
      className="space-y-6 sm:space-y-8 p-1 sm:p-2 animate-pulse"
      aria-label="Loading conversation messages"
    >
      {/* Simulated User Turn 1 */}
      <div className="flex justify-end gap-2 text-xs sm:text-sm">
        <div className="max-w-[75%] sm:max-w-[65%] flex flex-col items-end space-y-1.5">
          <div className="rounded-2xl rounded-br-xs px-4 py-3 bg-blue-600/25 border border-blue-500/20 shadow-sm w-56 sm:w-72">
            <div className="h-3 w-4/5 rounded bg-blue-400/30 mb-2" />
            <div className="h-3 w-1/2 rounded bg-blue-400/20" />
          </div>
          <div className="h-2 w-12 rounded bg-zinc-800/60 mr-1" />
        </div>
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-zinc-800 border border-white/10 shrink-0 mt-0.5" />
      </div>

      {/* Simulated AI Turn 1 */}
      <div className="flex justify-start gap-2 text-xs sm:text-sm">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 shrink-0 mt-0.5" />
        <div className="max-w-[85%] sm:max-w-[78%] flex flex-col items-start space-y-2 flex-1">
          <div className="rounded-2xl rounded-bl-xs p-3.5 sm:p-4 bg-zinc-950/75 border border-white/10 shadow-md w-full space-y-2.5">
            <div className="h-3 w-3/4 rounded bg-zinc-800" />
            <div className="h-3 w-full rounded bg-zinc-800/80" />
            <div className="h-3 w-5/6 rounded bg-zinc-800/70" />
            <div className="h-3 w-2/3 rounded bg-zinc-800/50" />
          </div>
          {/* Source badge placeholder */}
          <div className="flex items-center gap-1.5 px-1">
            <div className="h-2.5 w-12 rounded bg-zinc-800/60" />
            <div className="h-3 w-28 rounded bg-blue-500/10 border border-blue-500/20" />
          </div>
        </div>
      </div>

      {/* Simulated User Turn 2 */}
      <div className="flex justify-end gap-2 text-xs sm:text-sm">
        <div className="max-w-[75%] sm:max-w-[65%] flex flex-col items-end space-y-1.5">
          <div className="rounded-2xl rounded-br-xs px-4 py-3 bg-blue-600/25 border border-blue-500/20 shadow-sm w-44 sm:w-56">
            <div className="h-3 w-full rounded bg-blue-400/30" />
          </div>
          <div className="h-2 w-10 rounded bg-zinc-800/60 mr-1" />
        </div>
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-zinc-800 border border-white/10 shrink-0 mt-0.5" />
      </div>
    </div>
  );
}

/**
 * COMPONENT: ThinkingMessageSkeleton
 * Shimmering response card shown while the LLM is actively synthesizing a response.
 */
export function ThinkingMessageSkeleton() {
  return (
    <div className="flex gap-2 text-xs sm:text-sm items-start animate-in fade-in duration-200">
      <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
        <div className="absolute inset-0 rounded-lg bg-blue-400/20 animate-ping opacity-60" />
        <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5 relative z-10" />
      </div>
      <div className="max-w-[85%] sm:max-w-[78%] flex flex-col items-start space-y-2 flex-1">
        <div className="rounded-2xl rounded-bl-xs px-3.5 py-3 sm:px-4 sm:py-3.5 bg-zinc-950/80 border border-blue-500/30 shadow-lg w-full min-w-[240px] sm:min-w-[320px]">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[11px] font-medium text-blue-300">
              KelanaAI is thinking & researching...
            </span>
            <Sparkles className="w-2.5 h-2.5 text-blue-400/80 animate-spin" />
          </div>
          <div className="space-y-2">
            <div className="h-2.5 w-full rounded bg-zinc-800 animate-pulse" />
            <div
              className="h-2.5 w-4/5 rounded bg-zinc-800/80 animate-pulse"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="h-2.5 w-3/5 rounded bg-zinc-800/60 animate-pulse"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * COMPONENT: EmptySidebarState
 * Elegant dashed container displayed when the user has no conversations yet.
 */
export function EmptySidebarState({ onNewChat }: { onNewChat: () => void }) {
  return (
    <div className="p-3">
      <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-900/30 p-5 flex flex-col items-center justify-center text-center">
        <div className="w-9 h-9 rounded-xl bg-zinc-800/80 border border-white/10 text-zinc-400 flex items-center justify-center mb-2.5 shadow-inner">
          <MessageSquareDashed className="w-4 h-4 text-zinc-400" />
        </div>
        <p className="text-xs font-semibold text-zinc-300">No conversations yet</p>
        <p className="text-[10px] text-zinc-500 mt-1 max-w-[170px] leading-relaxed">
          Start a new thread to plan trips or ask travel regulations.
        </p>
        <button
          type="button"
          onClick={onNewChat}
          className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-[11px] font-medium transition-all active:scale-95 shadow-sm"
        >
          <Plus className="w-3 h-3" />
          <span>Start First Chat</span>
        </button>
      </div>
    </div>
  );
}

/**
 * COMPONENT: ChatPageSkeleton
 * Full-page shimmering layout skeleton matching the Chat UI shell (Navbar, Sidebar, Message Thread, Input Box).
 * Eliminates blank screens and spinner flicker during route navigation and Suspense hydration.
 */
export function ChatPageSkeleton() {
  return (
    <div className="flex h-screen h-[100dvh] flex-col overflow-hidden bg-background text-foreground selection:bg-blue-500/20 selection:text-blue-200">
      <Navbar />

      <main className="relative flex-1 min-h-0 flex flex-col px-4 py-8 pb-24 sm:pb-8 sm:px-6 lg:px-8 w-full">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-80 w-full max-w-5xl bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_60%)]" />

        <div className="relative mx-auto max-w-5xl w-full flex-1 min-h-0 flex rounded-2xl sm:rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-2xl shadow-2xl overflow-hidden">
          {/* Desktop Sidebar Placeholder */}
          <aside className="hidden md:flex w-64 lg:w-72 flex-col border-r border-white/10 bg-zinc-950/60 shrink-0">
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-800/80 animate-pulse" />
                <div className="h-3.5 w-24 rounded bg-zinc-800 animate-pulse" />
              </div>
              <div className="h-7 w-14 rounded-lg bg-zinc-800/80 animate-pulse" />
            </div>
            <div className="flex-1 min-h-0 overflow-hidden p-2">
              <SidebarConversationSkeleton />
            </div>
          </aside>

          {/* Main Chat Thread Area */}
          <div className="flex-1 min-w-0 flex flex-col bg-zinc-950/40 relative">
            {/* Header Placeholder */}
            <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between gap-3 bg-zinc-950/70 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-zinc-800 animate-pulse" />
                <div className="space-y-1">
                  <div className="h-3.5 w-32 rounded bg-zinc-800 animate-pulse" />
                  <div className="h-2 w-20 rounded bg-zinc-800/60 animate-pulse" />
                </div>
              </div>
              <div className="h-7 w-20 rounded-lg bg-zinc-800/80 animate-pulse" />
            </div>

            {/* Simulated Chat Messages */}
            <div className="flex-1 min-h-0 p-3 sm:p-4 overflow-hidden">
              <MessageThreadSkeleton />
            </div>

            {/* Input Box Placeholder */}
            <div className="p-3 sm:p-4 border-t border-white/10 bg-zinc-950/60 shrink-0">
              <div className="h-10 w-full rounded-xl bg-zinc-900/80 border border-white/10 flex items-center justify-between px-3">
                <div className="h-3 w-48 sm:w-64 rounded bg-zinc-800/60 animate-pulse" />
                <div className="w-6 h-6 rounded-lg bg-blue-600/40 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
