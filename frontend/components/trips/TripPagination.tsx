import { ChevronLeft, ChevronRight } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

/**
 * COMPONENT: TripPagination
 * Pagination controls displaying current page index, total count, and next/prev buttons.
 */
interface TripPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalFilteredCount: number;
  itemsPerPage: number;
}

/**
 * Pagination bar displaying current page index, total page count,
 * item boundaries, and previous/next page navigation buttons.
 */
export function TripPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalFilteredCount,
  itemsPerPage,
}: TripPaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalFilteredCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 sm:gap-4 pt-5 pb-2 border-t border-border/80">
      <Typography variant="muted" className="text-xs text-zinc-400 text-center sm:text-left">
        Showing <span className="font-semibold text-white">{startItem}</span>–
        <span className="font-semibold text-white">{endItem}</span> of{" "}
        <span className="font-semibold text-white">{totalFilteredCount}</span> trips
      </Typography>

      <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs px-3.5 h-9 rounded-xl border-border bg-secondary/80 hover:bg-zinc-800 active:scale-95 disabled:opacity-40"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </Button>

        <span className="shrink-0 flex items-center justify-center px-3.5 h-9 rounded-xl bg-secondary border border-border text-xs font-bold text-white shadow-inner">
          {currentPage} <span className="text-zinc-500 font-normal mx-1">/</span> {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs px-3.5 h-9 rounded-xl border-border bg-secondary/80 hover:bg-zinc-800 active:scale-95 disabled:opacity-40"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
