import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ATOMIC UI PRIMITIVE: Input
 * Utilizes semantic design tokens (--input, --border, --ring, --radius).
 */

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-xl border bg-input px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:bg-zinc-900 focus:outline-hidden focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-destructive focus:border-destructive focus:ring-destructive/20"
            : "border-border focus:border-ring focus:ring-ring/20",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
