import Link from "next/link";
import { Compass } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

// COMPONENT: EmptyState
// Displays clean, welcoming empty state when database has no saved itineraries (Session 7 Part 7)

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyState({
  title = "No trips found.",
  description = "Create your first bespoke travel itinerary with KelanaAI.",
  actionText = "Generate a Trip →",
  actionHref = "/",
}: EmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-card-border bg-card/40 p-8 sm:p-12 text-center backdrop-blur-xl">
      {/* Subtle Ambient Radial Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.08),transparent_70%)]" />

      {/* Center Illustrated Icon Badge */}
      <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-3xl shadow-inner">
        <Compass className="w-8 h-8 text-primary" />
      </div>

      {/* Main Title & Guiding Message */}
      <Typography variant="h3" className="font-bold text-white">
        {title}
      </Typography>
      <Typography variant="muted" className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        {description}
      </Typography>

      {/* Call To Action Button */}
      <div className="mt-6">
        <Link href={actionHref}>
          <Button variant="default" size="default" className="shadow-lg shadow-primary/20 active:scale-95">
            {actionText}
          </Button>
        </Link>
      </div>
    </div>
  );
}
