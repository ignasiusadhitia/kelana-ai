import { Typography } from "@/components/ui/typography";
import { Logo } from "@/components/Logo";

/**
 * COMPONENT: Navbar
 * Clean, modern navigation bar with subtle branding and quick navigation links.
 * Clicking "Plan Trip →" resets the trip view and scrolls to the planner form.
 */

interface NavbarProps {
  onPlanTrip?: () => void;
}

export function Navbar({ onPlanTrip }: NavbarProps) {
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo & Name */}
        <button
          type="button"
          onClick={handlePlanClick}
          className="cursor-pointer flex items-center gap-2.5 group text-left"
        >
          <Logo size={30} className="transition-transform group-hover:scale-105" />
          <Typography as="span" className="text-base font-extrabold tracking-tight text-white">
            Kelana<span className="text-blue-400">AI</span>
          </Typography>
        </button>

        {/* Navigation Links & Action */}
        <nav className="flex items-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={handlePlanClick}
            className="cursor-pointer text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Trip Planner
          </button>

          <button
            type="button"
            onClick={handlePlanClick}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-500 active:scale-95"
          >
            <span>Plan Trip</span>
            <span className="text-[10px]">→</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
