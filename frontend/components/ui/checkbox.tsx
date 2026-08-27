"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
}

/**
 * ATOMIC UI PRIMITIVE: Checkbox
 * Custom glassmorphic checkbox aligning 100% with the KelanaAI Design System.
 * Replaces unstyled native browser checkboxes with a responsive, accessible,
 * animated squircle with blue ambient glow and Lucide checkmark.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked = false,
      onCheckedChange,
      label,
      description,
      className,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    const handleToggle = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleToggle();
      }
    };

    return (
      <div
        onClick={handleToggle}
        className={cn(
          "group flex items-start gap-3 rounded-xl border border-white/5 bg-zinc-950/60 p-3 transition-all select-none",
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:border-primary/40 hover:bg-zinc-900/80 active:scale-[0.99]",
          checked && "border-primary/30 bg-primary/5",
          className
        )}
      >
        {/* Hidden native input for standard form/screen-reader accessibility */}
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          {...props}
        />

        {/* Custom Stylized Checkbox Squircle */}
        <div
          role="checkbox"
          aria-checked={checked}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex h-5 w-5 min-w-[20px] min-h-[20px] shrink-0 items-center justify-center rounded-lg border transition-all duration-200 mt-0.5",
            checked
              ? "border-primary bg-primary text-primary-foreground shadow-md shadow-blue-500/25 ring-2 ring-primary/20 scale-100"
              : "border-border bg-secondary/80 text-transparent group-hover:border-zinc-500 group-hover:bg-zinc-800",
            disabled && "cursor-not-allowed"
          )}
        >
          <Check
            className={cn(
              "w-3.5 h-3.5 stroke-[3] transition-all duration-200 text-white",
              checked ? "scale-100 opacity-100" : "scale-50 opacity-0"
            )}
          />
        </div>

        {/* Label & Optional Description */}
        {(label || description) && (
          <div className="flex flex-col text-left">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  "text-xs font-medium cursor-pointer transition-colors leading-tight",
                  checked ? "text-white font-semibold" : "text-zinc-300 group-hover:text-white"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <span className="text-[11px] text-muted-foreground mt-0.5">
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
