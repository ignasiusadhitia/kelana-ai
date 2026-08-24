import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default:
          "border border-blue-500/30 bg-blue-500/10 text-blue-300",
        secondary:
          "border border-white/10 bg-zinc-900/80 text-zinc-300",
        success:
          "border border-emerald-500/30 bg-emerald-950/40 text-emerald-300",
        warning:
          "border border-amber-500/30 bg-amber-950/40 text-amber-300",
        destructive:
          "border border-red-500/30 bg-red-950/40 text-red-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
