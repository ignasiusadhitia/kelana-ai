import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, LogIn } from "lucide-react";
import { tripFormSchema, TripFormValues } from "@/schemas/tripSchema";
import { TripRequest } from "@/types/trip";
import { TRAVEL_STYLE_OPTIONS } from "@/constants/trip";
import { Typography } from "@/components/ui/typography";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/toast";
import { DestinationField } from "./travel-form/DestinationField";
import { DurationField } from "./travel-form/DurationField";
import { BudgetField } from "./travel-form/BudgetField";
import { TravelStyleField } from "./travel-form/TravelStyleField";

/**
 * COMPONENT: TravelForm (Refactored & Modular Architecture)
 * Orchestrates form validation, draft preservation, proactive auth checking, and delegates to atomic field subcomponents.
 */

interface TravelFormProps {
  onSubmit: (data: TripRequest) => void;
}

function getInitialDraft(): Partial<TripFormValues> | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem("kelana_draft_trip");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function TravelForm({ onSubmit }: TravelFormProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [initialDraft] = useState<Partial<TripFormValues> | null>(getInitialDraft);
  const initialIsCustom = !!(
    initialDraft?.travel_style &&
    !TRAVEL_STYLE_OPTIONS.some((o) => o.id === initialDraft.travel_style)
  );

  const [isCustomStyle, setIsCustomStyle] = useState(initialIsCustom);
  const [customStyleText, setCustomStyleText] = useState(
    initialIsCustom ? initialDraft?.travel_style || "" : ""
  );

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      destination: initialDraft?.destination || "",
      budget: initialDraft?.budget ? Number(initialDraft.budget) : 2000,
      days: initialDraft?.days ? Number(initialDraft.days) : 5,
      travel_style: initialDraft?.travel_style || "Family",
    },
    mode: "onTouched",
  });

  const watchedDays = useWatch({ control, name: "days" });
  const watchedBudget = useWatch({ control, name: "budget" });
  const watchedStyle = useWatch({ control, name: "travel_style" });

  // Auto-fill preferred default travel style from user profile if no previous draft exists
  useEffect(() => {
    if (!initialDraft?.travel_style && user?.default_travel_style) {
      setValue("travel_style", user.default_travel_style, { shouldValidate: true });
    }
  }, [user?.default_travel_style, initialDraft, setValue]);

  const onFormSubmit: SubmitHandler<TripFormValues> = (values) => {
    const finalStyle = isCustomStyle ? customStyleText.trim() : values.travel_style;
    if (isCustomStyle && !finalStyle) {
      return;
    }

    const payload: TripRequest = {
      destination: values.destination.trim(),
      budget: Number(values.budget),
      days: Number(values.days),
      travel_style: finalStyle,
    };

    if (!isAuthenticated) {
      try {
        sessionStorage.setItem("kelana_draft_trip", JSON.stringify(payload));
      } catch {
        // ignore storage error
      }
      toast.info("Please sign in to save your plan. We've preserved your draft!", {
        title: "Sign In Required",
      });
      router.push("/login?redirect=/");
      return;
    }

    try {
      sessionStorage.removeItem("kelana_draft_trip");
    } catch {
      // ignore
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} noValidate className="space-y-5 sm:space-y-6">
      {/* 1. Destination Field */}
      <DestinationField
        register={register}
        setValue={setValue}
        error={errors.destination}
      />

      {/* 2. Duration & Budget Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        <DurationField
          register={register}
          setValue={setValue}
          watchedDays={watchedDays}
          error={errors.days}
        />
        <BudgetField
          register={register}
          setValue={setValue}
          watchedBudget={watchedBudget}
          error={errors.budget}
        />
      </div>

      {/* 3. Travel Style Field */}
      <TravelStyleField
        setValue={setValue}
        watchedStyle={watchedStyle}
        isCustomStyle={isCustomStyle}
        setIsCustomStyle={setIsCustomStyle}
        customStyleText={customStyleText}
        setCustomStyleText={setCustomStyleText}
      />

      {/* 4. Proactive Auth Guidance */}
      {!isAuthenticated && (
        <div className="flex items-center gap-2.5 rounded-xl border border-blue-500/20 bg-blue-950/40 px-3.5 py-2.5 text-xs text-blue-300 animate-in fade-in duration-200">
          <LogIn className="w-4 h-4 shrink-0 text-blue-400" />
          <span>
            Sign in or create a free account to save your generated itineraries.
          </span>
        </div>
      )}

      {/* 5. Submit Action */}
      <div className="pt-2">
        <button
          type="submit"
          className="cursor-pointer relative group w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 p-px font-semibold text-white shadow-xl shadow-blue-600/20 transition-all hover:shadow-blue-600/30 hover:scale-[1.005] active:scale-[0.99]"
        >
          <div className="flex items-center justify-center gap-2 rounded-[11px] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 px-6 py-4 transition-all group-hover:bg-opacity-90">
            {isAuthenticated ? (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <Typography as="span" variant="h4" className="text-white tracking-wide">
                  Generate Itinerary
                </Typography>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 text-blue-200" />
                <Typography as="span" variant="h4" className="text-white tracking-wide">
                  Sign In & Generate Itinerary
                </Typography>
              </>
            )}
          </div>
        </button>
      </div>
    </form>
  );
}
