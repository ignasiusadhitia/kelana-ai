"use client";

import * as React from "react";
import { Portal } from "@/components/ui/portal";
import { cn } from "@/lib/utils";

/**
 * ATOMIC UI PRIMITIVE: Custom Tooltip
 * Accessible glassmorphic floating tooltip teleported via Portal directly into document.body
 * to escape overflow-hidden and overflow-y-auto clipping in scrollable chat message streams.
 */

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  delayDuration?: number;
  className?: string;
  disabled?: boolean;
}

export function Tooltip({
  content,
  children,
  side = "top",
  delayDuration = 150,
  className,
  disabled = false,
}: TooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [coords, setCoords] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const tooltipId = React.useId();

  const calculateCoords = React.useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl ? tooltipEl.offsetWidth : 160;
    const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 32;

    let top = 0;
    let left = 0;
    const offset = 8; // 8px gap between trigger and tooltip

    if (side === "top") {
      top = triggerRect.top - tooltipHeight - offset;
      left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
    } else if (side === "bottom") {
      top = triggerRect.bottom + offset;
      left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
    } else if (side === "left") {
      top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
      left = triggerRect.left - tooltipWidth - offset;
    } else if (side === "right") {
      top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
      left = triggerRect.right + offset;
    }

    // Viewport collision clamping (prevent overflowing screen edges)
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
    const padding = 12;
    left = Math.max(padding, Math.min(viewportWidth - tooltipWidth - padding, left));

    setCoords({ top, left });
  }, [side]);

  const show = React.useCallback(() => {
    if (disabled || !content) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      calculateCoords();
      setIsOpen(true);
    }, delayDuration);
  }, [disabled, content, delayDuration, calculateCoords]);

  const hide = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsOpen(false);
  }, []);

  // Recalculate coordinates if window scrolls or resizes while open
  React.useEffect(() => {
    if (!isOpen) return;
    const handleScrollOrResize = () => {
      calculateCoords();
    };
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, calculateCoords]);

  // Escape key closes tooltip
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hide]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (disabled || !content) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        aria-describedby={isOpen ? tooltipId : undefined}
        className="inline-flex"
      >
        {children}
      </div>

      {isOpen && (
        <Portal>
          <div
            ref={(node) => {
              tooltipRef.current = node;
              if (node && (coords.top === 0 && coords.left === 0)) {
                calculateCoords();
              }
            }}
            id={tooltipId}
            role="tooltip"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            className={cn(
              "fixed z-[9999] pointer-events-none select-none max-w-xs",
              "rounded-xl border border-white/10 bg-zinc-950/95 px-3 py-1.5 shadow-2xl backdrop-blur-xl",
              "text-[11px] font-medium text-zinc-200 ring-1 ring-white/5",
              "animate-in fade-in zoom-in-95 duration-150",
              className
            )}
          >
            {content}
          </div>
        </Portal>
      )}
    </>
  );
}
