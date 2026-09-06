import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

/**
 * COMPONENT: EmptyState
 * Displays clean, welcoming empty state when database has no saved itineraries.
 * 100% Vector Icons & Zero Unicode arrow text.
 */

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
}

/**
 * Welcoming empty state placeholder rendered when a collection has no items,
 * providing descriptive feedback and an actionable primary button.
 */
export function EmptyState({
  title = "No trips found.",
  description = "Plan your first trip and save your itinerary here.",
  actionText = "Plan a Trip",
  actionHref = "/",
}: EmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/40 p-8 sm:p-12 text-center backdrop-blur-xl">
      {/* Subtle Ambient Radial Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.08),transparent_70%)]" />

      {/* Center Illustrated Icon Badge */}
      <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-inner">
        <Compass className="w-8 h-8 text-primary" />
      </div>

      {/* Main Title & Guiding Message */}
      <Typography variant="h3" className="font-bold text-white text-xl">
        {title}
      </Typography>
      <Typography variant="muted" className="mx-auto mt-2 max-w-sm text-sm text-zinc-400 leading-relaxed">
        {description}
      </Typography>

      {/* Call To Action Button */}
      <div className="mt-6">
        <Link href={actionHref}>
          <Button variant="default" size="default" className="gap-2 shadow-lg shadow-blue-500/20 active:scale-95">
            <span>{actionText}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
