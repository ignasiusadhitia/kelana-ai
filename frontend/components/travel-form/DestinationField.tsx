import { UseFormRegister, UseFormSetValue, FieldError } from "react-hook-form";
import { MapPin } from "lucide-react";
import { TripFormValues } from "@/schemas/tripSchema";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { ScrollableTrack } from "@/components/ui/scrollable-track";

/**
 * COMPONENT: DestinationField
 * Destination input field with popular global travel destination chips.
 */
interface DestinationFieldProps {
  register: UseFormRegister<TripFormValues>;
  setValue: UseFormSetValue<TripFormValues>;
  error?: FieldError;
}

const POPULAR_DESTINATIONS = [
  { name: "Tokyo, Japan" },
  { name: "Seoul, Korea" },
  { name: "Bali, Indonesia" },
  { name: "Rome, Italy" },
  { name: "Zurich, Switzerland" },
  { name: "Paris, France" },
];

/**
 * Form field for destination input, featuring quick-selection pill badges
 * for trending international destinations.
 */
export function DestinationField({ register, setValue, error }: DestinationFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2 min-w-0">
        <label htmlFor="destination" className="flex items-center gap-1.5 cursor-pointer shrink-0">
          <MapPin className="w-4 h-4 text-blue-400" />
          <Typography as="span" variant="kicker" className="text-zinc-300">
            Destination
          </Typography>
        </label>
        <Typography variant="muted" className="text-right min-w-0 truncate">
          Where do you want to go?
        </Typography>
      </div>

      <Input
        id="destination"
        {...register("destination")}
        type="text"
        placeholder="e.g. Tokyo, Japan or Seoul, Korea"
        error={!!error}
      />
      {error && (
        <Typography variant="caption" className="mt-1 font-medium text-red-400 block">
          {error.message}
        </Typography>
      )}

      {/* Quick Destination Inspiration Chips */}
      <div className="mt-2.5 flex items-center gap-2">
        <Typography variant="muted" className="text-xs font-semibold text-zinc-400 shrink-0">
          Popular:
        </Typography>

        <div className="flex-1 min-w-0">
          <ScrollableTrack className="gap-1.5" fadeWidth="w-8 sm:w-10">
            {POPULAR_DESTINATIONS.map((dest) => (
              <button
                key={dest.name}
                type="button"
                onClick={() => setValue("destination", dest.name, { shouldValidate: true })}
                className="cursor-pointer shrink-0 rounded-full border border-border bg-secondary/80 px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:border-primary/50 hover:bg-secondary hover:text-white active:scale-95"
              >
                {dest.name}
              </button>
            ))}
          </ScrollableTrack>
        </div>
      </div>
    </div>
  );
}
