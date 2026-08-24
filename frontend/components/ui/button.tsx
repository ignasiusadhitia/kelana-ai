import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * ATOMIC UI PRIMITIVE: Button
 * Utilizes semantic design tokens (--primary, --secondary, --destructive, --radius).
 */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-bold tracking-wide transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-primary-foreground shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:scale-[1.005]",
        outline:
          "border border-border bg-secondary text-secondary-foreground hover:border-zinc-700 hover:bg-zinc-800 hover:text-foreground",
        secondary:
          "border border-border bg-secondary text-secondary-foreground shadow-xs hover:bg-zinc-800 hover:text-foreground",
        ghost:
          "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-lg shadow-red-600/20 hover:bg-red-700",
      },
      size: {
        default: "px-4 py-3",
        sm: "px-3 py-1.5 text-[11px]",
        lg: "px-6 py-4 text-sm",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
