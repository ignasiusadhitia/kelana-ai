import { Typography } from "@/components/ui/typography";
import { Logo } from "@/components/Logo";

/**
 * COMPONENT: Footer
 * Application footer with brand summary, essential navigation links, and dynamic copyright notice.
 */

interface FooterProps {
  onPlanTrip?: () => void;
}

export function Footer({ onPlanTrip }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handlePlanClick = (e: React.MouseEvent) => {
    if (onPlanTrip) {
      e.preventDefault();
      onPlanTrip();
      const el = document.getElementById("planner");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="mt-auto border-t border-border bg-background/80 backdrop-blur-xl py-10 text-xs text-muted-foreground">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-border">
          {/* Brand Summary */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
            <button
              type="button"
              onClick={handlePlanClick}
              className="cursor-pointer flex items-center gap-2 text-left group"
            >
              <Logo size={22} className="transition-transform group-hover:scale-105" />
              <Typography as="span" className="text-sm font-extrabold tracking-tight text-white">
                Kelana<span className="text-blue-400">AI</span>
              </Typography>
            </button>
            <Typography variant="muted" className="text-zinc-400 max-w-xs block">
              Smart travel planning curated for every destination, duration, and budget.
            </Typography>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-300">
            <button
              type="button"
              onClick={handlePlanClick}
              className="cursor-pointer hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              type="button"
              onClick={handlePlanClick}
              className="cursor-pointer hover:text-white transition-colors"
            >
              Trip Planner
            </button>
            <a href="#" className="hover:text-white transition-colors">Destinations</a>
            <a href="#" className="hover:text-white transition-colors">Guides</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </nav>
        </div>

        {/* Dynamic Copyright Notice */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <Typography variant="muted" className="text-zinc-500">
            © {currentYear} KelanaAI Inc. All rights reserved.
          </Typography>
          <div className="flex items-center gap-2">
            <Typography as="span" variant="muted" className="text-zinc-500">
              Built for curious travelers
            </Typography>
          </div>
        </div>
      </div>
    </footer>
  );
}
