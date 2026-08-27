"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollableTrackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  scrollAmount?: number;
  fadeWidth?: string;
  buttonClassName?: string;
  fadeClassName?: string;
}

/**
 * ATOMIC UI PRIMITIVE: ScrollableTrack
 * Provides sleek horizontal scrolling with dynamic edge fade gradients
 * and contextual floating Left/Right Chevron buttons that automatically appear
 * only when content overflows and is scrollable in that direction.
 * Ensures perfectly round, non-squished circular buttons (aspect-square & shrink-0).
 */
export function ScrollableTrack({
  children,
  className,
  scrollAmount = 280,
  fadeWidth = "w-12 sm:w-16",
  buttonClassName,
  fadeClassName,
  ...props
}: ScrollableTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (trackRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const el = trackRef.current;
    if (!el) return;

    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);

    // Observe children mutations (e.g. async items or deletion)
    const observer = new MutationObserver(checkScroll);
    observer.observe(el, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, [checkScroll, children]);

  const handleScroll = (direction: "left" | "right") => {
    if (trackRef.current) {
      const delta = direction === "left" ? -scrollAmount : scrollAmount;
      trackRef.current.scrollBy({ left: delta, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group/scroll-track w-full">
      {/* Left Chevron & Fade Mask (Appears only when scrollable to left) */}
      {canScrollLeft && (
        <div
          className={cn(
            "pointer-events-none absolute left-0 inset-y-0 z-20 flex items-center justify-start bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent pr-4",
            fadeWidth,
            fadeClassName
          )}
        >
          <button
            type="button"
            onClick={() => handleScroll("left")}
            className={cn(
              "pointer-events-auto cursor-pointer shrink-0 aspect-square flex h-8 w-8 min-w-[32px] min-h-[32px] sm:h-9 sm:w-9 sm:min-w-[36px] sm:min-h-[36px] items-center justify-center rounded-full bg-zinc-900/95 border border-white/20 text-white shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:bg-zinc-800 hover:border-primary/60 active:scale-90",
              buttonClassName
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
          </button>
        </div>
      )}

      {/* Main Scroll Container */}
      <div
        ref={trackRef}
        onScroll={checkScroll}
        className={cn(
          "flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 touch-pan-x scroll-smooth",
          className
        )}
        {...props}
      >
        {children}
      </div>

      {/* Right Chevron & Fade Mask (Appears only when scrollable to right) */}
      {canScrollRight && (
        <div
          className={cn(
            "pointer-events-none absolute right-0 inset-y-0 z-20 flex items-center justify-end bg-gradient-to-l from-zinc-950 via-zinc-950/80 to-transparent pl-4",
            fadeWidth,
            fadeClassName
          )}
        >
          <button
            type="button"
            onClick={() => handleScroll("right")}
            className={cn(
              "pointer-events-auto cursor-pointer shrink-0 aspect-square flex h-8 w-8 min-w-[32px] min-h-[32px] sm:h-9 sm:w-9 sm:min-w-[36px] sm:min-h-[36px] items-center justify-center rounded-full bg-zinc-900/95 border border-white/20 text-white shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:bg-zinc-800 hover:border-primary/60 active:scale-90",
              buttonClassName
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      )}
    </div>
  );
}
