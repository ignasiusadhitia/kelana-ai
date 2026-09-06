"use client";

import { Compass, Send } from "lucide-react";
import { Typography } from "@/components/ui/typography";

export interface SuggestedPromptItem {
  label: string;
  prompt: string;
}

interface SuggestedPromptsGridProps {
  prompts: SuggestedPromptItem[];
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

/**
 * COMPONENT: SuggestedPromptsGrid
 * Welcome prompt cards displayed when starting a new conversation thread.
 */
export function SuggestedPromptsGrid({
  prompts,
  onSelectPrompt,
  disabled = false,
}: SuggestedPromptsGridProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-3 sm:p-4 max-w-2xl mx-auto my-auto animate-in fade-in zoom-in-95 duration-200">
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
        {prompts.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(item.prompt)}
            disabled={disabled}
            className="text-left text-xs text-zinc-300 bg-zinc-950/60 hover:bg-blue-600/20 hover:text-blue-200 hover:border-blue-500/40 border border-white/10 rounded-xl p-2.5 transition-all flex items-center justify-between group shadow-sm active:scale-98 disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed"
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
  );
}
