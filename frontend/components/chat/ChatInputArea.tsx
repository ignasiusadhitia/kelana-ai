"use client";

import React from "react";
import { Send, Loader2, WifiOff } from "lucide-react";

export interface ChatInputAreaProps {
  input: string;
  isSending: boolean;
  isOnline: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInputChange: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
}

/**
 * COMPONENT: ChatInputArea
 * Sticky bottom chat composition bar with offline detection, auto-sizing textarea,
 * loading spinner, and keyboard submission handling.
 */
export function ChatInputArea({
  input,
  isSending,
  isOnline,
  textareaRef,
  onInputChange,
  onKeyDown,
  onSubmit,
}: ChatInputAreaProps) {
  return (
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
          onSubmit();
        }}
        className="relative flex items-end gap-1.5 sm:gap-2 bg-zinc-950/80 border border-white/10 rounded-xl p-1.5 focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-inner"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
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
  );
}
