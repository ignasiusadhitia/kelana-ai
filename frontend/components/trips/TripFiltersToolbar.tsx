import { Search, X, Clock, History, TrendingUp, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { CustomSelect, SelectOption } from "@/components/ui/select";
import { ScrollableTrack } from "@/components/ui/scrollable-track";
import { getTravelStyleIconComponent } from "@/lib/icons";

export type SortOption = "latest" | "oldest" | "highest-budget" | "lowest-budget";

export const SORT_OPTIONS: SelectOption[] = [
  { value: "latest", label: "Latest (Newest First)", icon: <Clock className="w-3.5 h-3.5 text-blue-400" /> },
  { value: "oldest", label: "Oldest (First First)", icon: <History className="w-3.5 h-3.5 text-zinc-400" /> },
  { value: "highest-budget", label: "Highest Budget", icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> },
  { value: "lowest-budget", label: "Lowest Budget", icon: <Tag className="w-3.5 h-3.5 text-amber-400" /> },
];

/**
 * COMPONENT: TripFiltersToolbar
 * Filter toolbar providing search input, travel style pills, and multi-mode sorting dropdown.
 */
interface TripFiltersToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  sortMode: SortOption;
  onSortChange: (val: SortOption) => void;
  selectedStyle: string;
  onStyleChange: (style: string) => void;
  availableStyles: string[];
  totalTripsCount: number;
}

export function TripFiltersToolbar({
  searchQuery,
  onSearchChange,
  sortMode,
  onSortChange,
  selectedStyle,
  onStyleChange,
  availableStyles,
  totalTripsCount,
}: TripFiltersToolbarProps) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input with Instant Clear Button */}
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" />
          </span>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search trips by destination or style (e.g. Kyoto, Solo)..."
            className="pl-10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              aria-label="Clear search"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Custom Select Sort Dropdown */}
        <div className="flex items-center gap-2">
          <Typography as="span" variant="muted" className="text-xs shrink-0">
            Sort by:
          </Typography>
          <CustomSelect
            value={sortMode}
            onValueChange={(val) => onSortChange(val as SortOption)}
            options={SORT_OPTIONS}
            ariaLabel="Sort trips by criteria"
          />
        </div>
      </div>

      {/* Style Filter Pills with Automatic Flanking Scroll Chevrons */}
      {availableStyles.length > 1 && (
        <div className="mt-3.5 pt-3 border-t border-border flex items-center gap-2">
          <Typography as="span" variant="kicker" className="text-[10px] text-muted-foreground mr-0.5 shrink-0">
            Style:
          </Typography>

          <div className="flex-1 min-w-0">
            <ScrollableTrack className="gap-1.5" fadeWidth="w-8 sm:w-10">
              <button
                type="button"
                onClick={() => onStyleChange("ALL")}
                className={`cursor-pointer shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-all active:scale-95 ${
                  selectedStyle === "ALL"
                    ? "bg-primary text-white"
                    : "bg-secondary text-muted-foreground hover:text-white"
                }`}
              >
                All ({totalTripsCount})
              </button>
              {availableStyles.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => onStyleChange(style)}
                  className={`cursor-pointer shrink-0 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all active:scale-95 ${
                    selectedStyle === style
                      ? "bg-primary text-white shadow-sm"
                      : "bg-secondary text-muted-foreground hover:text-white"
                  }`}
                >
                  {getTravelStyleIconComponent(style, { className: "w-3 h-3 text-blue-300" })}
                  <span>{style}</span>
                </button>
              ))}
            </ScrollableTrack>
          </div>
        </div>
      )}
    </Card>
  );
}
