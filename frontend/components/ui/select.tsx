"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ATOMIC PRIMITIVE: Custom Select Dropdown
// Replaces unstyled native HTML select with a custom, accessible glassmorphic dropdown matching the KelanaAI design system.

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

export function CustomSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  className,
  ariaLabel,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listboxId = React.useId();

  const selectedOption = options.find((opt) => opt.value === value);

  // Close popup on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Keyboard navigation & accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      if (!isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative inline-block text-left select-none",
        isOpen ? "z-50" : "z-10",
        className
      )}
    >
      {/* Trigger Button */}
      <button
        type="button"
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={cn(
          "cursor-pointer flex w-full items-center justify-between gap-2.5 rounded-xl border border-border bg-secondary/90 px-3.5 py-2 text-xs font-medium text-foreground backdrop-blur-md transition-all duration-200 hover:border-primary/50 hover:bg-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 active:scale-[0.98]",
          isOpen && "border-primary ring-2 ring-primary/20 bg-secondary"
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180 text-primary"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu Popup (Highest Z-Index + Strong Shadow) */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute right-0 z-50 mt-1.5 min-w-[200px] w-max max-h-60 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-1.5 text-xs text-foreground shadow-2xl shadow-black ring-1 ring-white/10 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="space-y-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onValueChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "cursor-pointer flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors text-left",
                    isSelected
                      ? "bg-primary/20 text-primary font-semibold"
                      : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {option.icon}
                    <span>{option.label}</span>
                  </span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
