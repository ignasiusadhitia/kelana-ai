import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * ATOMIC UI PRIMITIVE: Typography
 * Single source of truth for text styles, scale, line-heights, and weights.
 * Supports polymorphic rendering via the `as` prop.
 */

const typographyVariants = cva("text-zinc-100", {
  variants: {
    variant: {
      h1: "text-2xl sm:text-4xl font-extrabold tracking-tight text-white",
      h2: "text-xl sm:text-2xl font-extrabold tracking-tight text-white",
      h3: "text-base sm:text-lg font-bold tracking-tight text-white",
      h4: "text-sm font-semibold text-zinc-200",
      lead: "text-xs sm:text-sm text-zinc-300 leading-relaxed",
      body: "text-sm text-zinc-300 leading-relaxed",
      caption: "text-xs text-zinc-400 leading-normal",
      muted: "text-[11px] text-zinc-500",
      kicker: "text-xs font-bold uppercase tracking-wider text-zinc-400",
      gradient: "font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType;
}

export function Typography({
  className,
  variant = "body",
  as,
  ...props
}: TypographyProps) {
  // Infer semantic HTML tag from variant if not explicitly provided
  const Component =
    as ||
    (variant === "h1"
      ? "h1"
      : variant === "h2"
      ? "h2"
      : variant === "h3"
      ? "h3"
      : variant === "h4"
      ? "h4"
      : variant === "kicker" || variant === "caption" || variant === "muted" || variant === "gradient"
      ? "span"
      : "p");

  return (
    <Component
      className={cn(typographyVariants({ variant }), className)}
      {...props}
    />
  );
}
