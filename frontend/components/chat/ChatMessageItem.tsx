"use client";

import React from "react";
import { ChatMessage } from "@/services/chatService";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { SourceCitations } from "@/components/chat/SourceCitations";
import { Tooltip } from "@/components/ui/tooltip";
import {
  parseMessageContentAndSources,
  isFailedMessage,
  formatTimestamp,
  formatFullDateTooltip,
  formatDateDivider,
} from "@/lib/chatUtils";
import {
  Bot,
  User,
  AlertCircle,
  RotateCcw,
  RotateCw,
  Copy,
  Check,
  Edit2,
  Send,
  Loader2,
  Clock,
  BookmarkPlus,
  BookmarkCheck,
  Sparkles,
} from "lucide-react";

export interface ChatMessageItemProps {
  msg: ChatMessage;
  idx: number;
  totalMessages: number;
  showDateDivider: boolean;
  isEditingThis: boolean;
  editMessageInput: string;
  isSubmittingEdit: boolean;
  isSending: boolean;
  isCopied: boolean;
  isRegenerating: boolean;
  isLastMessage: boolean;
  currentTripId?: string | null;
  isSaved: boolean;
  isApplyingBlueprint: boolean;
  onStartEditMessage: (msg: ChatMessage) => void;
  onCancelEditMessage: () => void;
  onSaveEditMessage: (msgId: string | number) => void;
  onEditInputChange: (text: string) => void;
  onCopyMessage: (msgId: string | number, text: string) => void;
  onRegenerateResponse: () => void;
  onApplyToBlueprint: (content: string, msgId: string | number) => void;
  onOpenSaveTrip: (content: string, msgId: string | number) => void;
  onNavigateToTrip: (tripId?: string | null) => void;
}

/**
 * COMPONENT: ChatMessageItem
 * Fully encapsulates a single message turn, including avatars, bubble styling,
 * inline editor, error retry, markdown parsing, and contextual itinerary actions.
 */
export const ChatMessageItem = React.memo(function ChatMessageItem({
  msg,
  idx,
  totalMessages,
  showDateDivider,
  isEditingThis,
  editMessageInput,
  isSubmittingEdit,
  isSending,
  isCopied,
  isRegenerating,
  isLastMessage,
  currentTripId,
  isSaved,
  isApplyingBlueprint,
  onStartEditMessage,
  onCancelEditMessage,
  onSaveEditMessage,
  onEditInputChange,
  onCopyMessage,
  onRegenerateResponse,
  onApplyToBlueprint,
  onOpenSaveTrip,
  onNavigateToTrip,
}: ChatMessageItemProps) {
  const isUser = msg.role === "user";
  const isFailed = isFailedMessage(msg);
  const { text: cleanText, sources } = isUser
    ? { text: msg.content, sources: [] }
    : parseMessageContentAndSources(msg.content);

  // Guard: Do not render empty assistant turns
  if (!isUser && !msg.content) return null;

  const hasItineraryContent =
    !isUser &&
    (cleanText.includes("Day 1") ||
      cleanText.includes("## Day") ||
      cleanText.toLowerCase().includes("itinerary") ||
      cleanText.toLowerCase().includes("jadwal") ||
      cleanText.toLowerCase().includes("hari 1"));

  return (
    <div className="space-y-3.5 sm:space-y-4">
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
        {/* Left AI Bot Avatar */}
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
              {idx < totalMessages - 2 && (
                <p className="text-[10px] text-amber-400/80 flex items-center gap-1 px-1">
                  <span>⚠</span>
                  Subsequent messages will be cleared and regenerated from here.
                </p>
              )}
              <textarea
                autoFocus
                value={editMessageInput}
                onChange={(e) => onEditInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") onCancelEditMessage();
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSaveEditMessage(msg.id);
                  }
                }}
                disabled={isSubmittingEdit}
                rows={3}
                className="w-full min-w-[260px] sm:min-w-[340px] bg-zinc-900/80 border border-blue-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-400/70 resize-none disabled:opacity-60"
              />
              <div className="flex items-center gap-1.5 justify-end">
                <button
                  type="button"
                  onClick={onCancelEditMessage}
                  className="px-2.5 py-1 rounded-lg text-[10px] text-zinc-400 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onSaveEditMessage(msg.id)}
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
              {/* --- Error card (failed stream) --- */}
              {isFailed ? (
                <div className="rounded-2xl rounded-bl-xs px-3 py-2.5 sm:px-3.5 sm:py-3 shadow-md bg-red-950/40 border border-red-500/25 text-red-300 max-w-xs">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-[11px] sm:text-xs leading-relaxed">
                        Something went wrong — the response could not be generated.
                      </p>
                      <button
                        type="button"
                        onClick={onRegenerateResponse}
                        disabled={isSending || isRegenerating}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-red-500/20 hover:bg-red-500/35 border border-red-500/30 text-red-300 hover:text-red-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRegenerating ? (
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-2.5 h-2.5" />
                        )}
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* --- Normal message content bubble --- */
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
                          onClick={() => onCopyMessage(msg.id, cleanText)}
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
                          onClick={() => onStartEditMessage(msg)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/10 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </div>
              )}

              {/* Source citation badge — only for normal AI messages */}
              {!isUser && !isFailed && (
                <SourceCitations sources={sources} />
              )}

              {/* Bottom action row: timestamp + Copy + Regenerate — hidden for error messages */}
              {!isFailed && (
                <div className={`mt-1 flex items-center gap-1.5 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                  <Tooltip content={formatFullDateTooltip(msg.created_at)} side="top">
                    <span className="text-[9px] text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 cursor-default select-none">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTimestamp(msg.created_at)}
                    </span>
                  </Tooltip>

                  {/* Copy button — all non-error messages */}
                  <Tooltip content={isCopied ? "Copied!" : "Copy message"} side="top">
                    <button
                      type="button"
                      onClick={() => onCopyMessage(msg.id, cleanText)}
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
                        onClick={() => onStartEditMessage(msg)}
                        disabled={isSending}
                        className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors sm:hidden disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                      </button>
                    </Tooltip>
                  )}

                  {/* Regenerate — latest assistant turn only (non-error) */}
                  {!isUser && isLastMessage && (
                    <Tooltip content="Regenerate response" side="top">
                      <button
                        type="button"
                        onClick={onRegenerateResponse}
                        disabled={isSending || isRegenerating}
                        className="p-1 rounded-md text-zinc-500 hover:text-blue-400 hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed sm:opacity-0 sm:group-hover/msg:opacity-100 focus:opacity-100"
                      >
                        <RotateCw className={`w-2.5 h-2.5 ${isRegenerating ? "animate-spin text-blue-400" : ""}`} />
                      </button>
                    </Tooltip>
                  )}

                  {/* Save as Trip button — only for normal AI messages with itinerary content */}
                  {hasItineraryContent && (
                    isSaved ? (
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
                          onClick={() => onNavigateToTrip(currentTripId)}
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
                          onClick={() => onApplyToBlueprint(cleanText, msg.id)}
                          disabled={isApplyingBlueprint}
                          className="cursor-pointer inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition-all active:scale-95 ml-1 disabled:opacity-50"
                        >
                          {isApplyingBlueprint ? (
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
                          onClick={() => onOpenSaveTrip(cleanText, msg.id)}
                          className="cursor-pointer inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-all active:scale-95 ml-1"
                        >
                          <BookmarkPlus className="w-2.5 h-2.5" />
                          <span className="hidden sm:inline">Save as Official Trip</span>
                        </button>
                      </Tooltip>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right User Avatar */}
        {isUser && (
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-zinc-800 border border-white/10 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
            <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
        )}
      </div>
    </div>
  );
});
