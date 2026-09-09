import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes with standard clsx resolution.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility to strictly limit and round any decimal number to maximum 2 decimal places.
 * Handles floating-point arithmetic precision (e.g. 1.005 -> 1.01).
 *
 * @param value Number or numeric string to round
 * @returns Clean numeric value with at most 2 decimal places
 */
export function roundToTwoDecimals(value: number | string): number {
  const numeric = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numeric)) return 0;
  return Math.round((numeric + Number.EPSILON) * 100) / 100;
}

/**
 * Formats a number with commas and at most 2 decimal places.
 * E.g.: 1428.5714 -> "1,428.57", 2000 -> "2,000"
 */
export function formatDecimal(
  value: number | string,
  options?: { minFractionDigits?: number; maxFractionDigits?: number }
): string {
  const numeric = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numeric)) return "0";
  return numeric.toLocaleString("en-US", {
    minimumFractionDigits: options?.minFractionDigits ?? 0,
    maximumFractionDigits: options?.maxFractionDigits ?? 2,
  });
}

/**
 * Formats a numeric or string budget into clean USD currency display with at most 2 decimal digits.
 * E.g.: 2000 -> "USD 2,000", 1428.5714 -> "USD 1,428.57"
 */
export function formatBudget(amount: number | string): string {
  const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numeric)) return "USD 0";
  return `USD ${numeric.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Strips chat assistant pleasantries/greetings (e.g. "Absolutely! Here's a revised 5-day itinerary...")
 * preceding the structured itinerary sections (e.g. ## Day 1 or **Day 1**), preventing conversational
 * chitchat from polluting formal trip blueprints.
 */
export function stripConversationalPreamble(text: string): string {
  if (!text) return "";
  const match = text.match(/(?:^|\n)(#{1,3}\s+[\w\s:-]+|\*\*(?:Day|Hari)\s+\d+)/i);
  if (match && match.index !== undefined && match.index > 0) {
    const preamble = text.slice(0, match.index).trim();
    const isPreambleGreeting =
      /^(?:absolutely|sure|certainly|of course|here(?:'s| is)|i(?:'ve| have) (?:created|updated|revised|prepared|tailored)|tentu|baik|ini|berikut)\b/i.test(preamble) ||
      (preamble.length < 350 && !preamble.includes("\n-") && !preamble.includes("\n*") && !preamble.includes("\n1."));
    if (isPreambleGreeting) {
      return text.slice(match.index).trim();
    }
  }
  return text.trim();
}

export interface ExtractedTripDetails {
  destination: string;
  days: number;
  budget: number;
  travelStyle: string;
}

/**
 * Automatically extracts trip attributes (destination, duration, budget, travel style)
 * from chat conversation messages (AI itinerary text, preceding user prompt, or title).
 */
export function extractTripDetailsFromContent({
  aiText = "",
  userPrompt = "",
  conversationTitle = "",
  defaultStyle = "Family",
}: {
  aiText?: string;
  userPrompt?: string;
  conversationTitle?: string;
  defaultStyle?: string;
}): ExtractedTripDetails {
  const combined = (aiText + "\n" + userPrompt).trim();

  // 1. DURATION (DAYS)
  const dayMatches = [...aiText.matchAll(/(?:^|\n)##\s+(?:Day|Hari)\s+(\d+)/gi)];
  const headingDays =
    dayMatches.length > 0
      ? Math.max(...dayMatches.map((m) => parseInt(m[1], 10)).filter((n) => !isNaN(n)))
      : 0;

  const titleDurMatch = combined.match(/(\d+)[\s-]*(?:days?|hari)\b/i);
  const titleDays = titleDurMatch ? parseInt(titleDurMatch[1], 10) : 0;

  const rawDays = Math.max(headingDays, titleDays) || 3;
  const days = Math.max(1, Math.min(rawDays, 14));

  // 2. TRAVEL STYLE
  // Preset style IDs (normalized casing) — free-text allowed beyond these
  const PRESET_STYLES = ["Backpacker", "Solo", "Family", "Couple", "Luxury", "Adventure", "Culinary", "Wellness"];

  // Synonym map: each preset → regex pattern for detection
  const STYLE_SYNONYMS: Record<string, RegExp> = {
    Backpacker: /(?:backpacker|hemat|hostel|budget\s+traveler)/i,
    Couple:     /(?:couple|honeymoon|pasangan|romantic|romantis)/i,
    Luxury:     /(?:luxury|mewah|5-star|five-star|resort|premium)/i,
    Adventure:  /(?:adventure|petualang|hiking|trekking|outdoor|extreme)/i,
    Culinary:   /(?:culinary|kuliner|street\s+food|foodie|gastronomy|dining)/i,
    Wellness:   /(?:wellness|spa|meditasi|relax|santai|healing|meditation)/i,
    Solo:       /(?:\bsolo\b|sendiri|me\s+time)/i,
    Family:     /(?:family|keluarga|anak|kids|children)/i,
  };

  const STOP_WORDS = new Set([
    "day", "days", "hari", "short", "long", "quick", "great", "fun",
    "first", "next", "my", "our", "a", "an", "the", "good", "official",
    "new", "planned", "summer", "winter"
  ]);

  let travelStyle = defaultStyle || "Family";

  // Priority 1: explicit declaration, e.g. "travel style: Photography", "style: Cultural Exploration with budget $1000"
  const explicitMatch = (userPrompt + "\n" + aiText).match(
    /(?:travel\s+style|gaya\s+perjalanan|travel\s+mode|style)\s*[:\-–—=]\s*([A-Za-z][A-Za-z\s]{1,30}?)(?:\s+(?:with|budget|for|pada|under|dengan)|\s*[,.\n!?]|$)/i
  );
  if (explicitMatch) {
    const raw = explicitMatch[1].trim();
    const matchedPreset = PRESET_STYLES.find((p) => p.toLowerCase() === raw.toLowerCase());
    travelStyle = matchedPreset ?? raw;
  } else {
    // Priority 2: exact preset name mentioned verbatim in user prompt (most reliable signal)
    const presetInPrompt = PRESET_STYLES.find((p) =>
      new RegExp(`\\b${p}\\b`, "i").test(userPrompt)
    );
    if (presetInPrompt) {
      travelStyle = presetInPrompt;
    } else {
      // Priority 3: Indonesian / conversational style phrase, e.g. "ala [style]", "tema [style]", "fokus [style]"
      const modeMatch = userPrompt.match(
        /\b(?:ala|mode|tema|fokus|nuansa)\s+([A-Za-z][A-Za-z\s]{1,30}?)(?:\s+(?:trip|travel|liburan|tour|jalan-jalan)|\s*[,.?!]|$)/i
      );
      // Priority 4: phrase like "[N-day] [Custom Style] trip/tour to [Destination]"
      const tripPhraseMatch = userPrompt.match(
        /(?:^|\s)(?:\d+[\s-]*(?:days?|hari)\s+)?([A-Za-z]{3,20}(?:\s+[A-Za-z]{3,20})?)\s+(?:trip|tour|vacation|holiday)\s+(?:to|ke|in|di)\b/i
      );

      let candidate = (modeMatch?.[1] || tripPhraseMatch?.[1] || "").trim();
      candidate = candidate.replace(/^(?:\d+[\s-]*)?(?:days?|hari)\s+/i, "").trim();

      if (candidate && !STOP_WORDS.has(candidate.toLowerCase())) {
        if (candidate.toLowerCase() === "road") {
          travelStyle = "Road Trip";
        } else {
          const matchedPreset = PRESET_STYLES.find((p) => p.toLowerCase() === candidate.toLowerCase());
          travelStyle =
            matchedPreset ??
            candidate
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(" ");
        }
      } else {
        // Priority 5: synonym keyword match (scan userPrompt first, then full combined)
        const scanText = userPrompt || combined;
        const matchedByKeyword = Object.entries(STYLE_SYNONYMS).find(([, pattern]) =>
          pattern.test(scanText)
        );
        if (matchedByKeyword) {
          travelStyle = matchedByKeyword[0];
        }
        // else: stay at defaultStyle (passed from user profile or component default)
      }
    }
  }

  // 3. BUDGET (USD)
  let budget = 1500;
  // Priority 1: Explicit budget stated in USER PROMPT (user's explicit constraint)
  const promptExplicitBudget = userPrompt.match(
    /(?:budget|biaya|anggaran)(?:\s*(?:of|is|sebesar|sekitar|:))?\s*~?\s*(?:(?:USD|\$|Rp\.?|IDR)\s*)?([0-9][0-9,.]*)/i
  );
  const promptDollarMatch = userPrompt.match(/(?:USD|\$)\s*([0-9][0-9,.]*)/i);
  const promptTrailingDollar = userPrompt.match(/([0-9][0-9,.]*)\s*(?:USD|dollar|dolar)\b/i);

  const userPromptBudgetStr =
    promptExplicitBudget?.[1] || promptDollarMatch?.[1] || promptTrailingDollar?.[1];

  if (userPromptBudgetStr) {
    const num = parseInt(userPromptBudgetStr.replace(/[,.]/g, ""), 10);
    if (!isNaN(num) && num >= 50 && num <= 1000000) {
      budget = num;
    }
  } else {
    // Priority 2: Budget extracted from AI text / total estimated budget
    const totalBudgetMatch = aiText.match(
      /(?:total\s*(?:estimated\s*)?budget|estimated\s*budget|total\s*biaya|total\s*cost)[\s:]*~?\s*(?:(?:USD|\$|Rp\.?|IDR)\s*)?([0-9][0-9,.]*)/i
    );
    const aiBudgetMatch = aiText.match(
      /(?:budget|biaya|anggaran)(?:\s*(?:of|is|sebesar|sekitar|:))?\s*~?\s*(?:(?:USD|\$|Rp\.?|IDR)\s*)?([0-9][0-9,.]*)/i
    );
    const aiRawBudgetStr = totalBudgetMatch?.[1] || aiBudgetMatch?.[1];
    if (aiRawBudgetStr) {
      const num = parseInt(aiRawBudgetStr.replace(/[,.]/g, ""), 10);
      if (!isNaN(num) && num >= 50 && num <= 1000000) {
        budget = num;
      }
    }
  }

  // 4. DESTINATION
  let destination = "";

  // Priority 1: Explicit destination in USER PROMPT (e.g. "trip to Mozambique", "liburan ke Bali", "in Osaka focusing on food")
  if (userPrompt) {
    const pPrompt = userPrompt.match(
      /\b(?:to|ke|in|di|for|keliling|visit|visiting)\s+([A-Z][A-Za-z\s]{1,40}?)(?:\s+(?:with|for|pada|selama|dengan|budget|under|using|ala|fokus|focus|focusing|focussing|focused|focussed|highlighting|featuring|exploring|around|trip|travel|holiday|vacation|liburan|tour)|\s*[,.?!]|$)/i
    );
    if (pPrompt) {
      destination = pPrompt[1].trim();
    }
  }

  // Priority 2: Document title in AI text (excluding Day/Hari headers)
  if (!destination) {
    const firstLines = aiText.split("\n").slice(0, 8).join("\n");
    const pDoc = firstLines.match(
      /(?:^|\n)##?\s+(?!Day\b|Hari\b).*?\b(?:to|in|ke|di)\s+([A-Z][A-Za-z0-9\s,.-]+?)(?:\s+[-–—:|]|\s*\n|$)/i
    );
    if (pDoc) {
      destination = pDoc[1].trim();
    }
  }

  // Priority 3: ## [Destination] [N]-Day Itinerary in AI text
  if (!destination) {
    const firstLines = aiText.split("\n").slice(0, 8).join("\n");
    const p2 = firstLines.match(
      /(?:^|\n)##?\s+(?!Day\b|Hari\b)([A-Z][A-Za-z\s]+?)\s+\d+[\s-]*(?:days?|hari)\b/i
    );
    if (p2) destination = p2[1].trim();
  }

  // Priority 4: Destination from conversation title
  if (!destination && conversationTitle) {
    const cleanTitle = conversationTitle
      .replace(/^(?:Chat:\s*|Trip:\s*)/i, "")
      .replace(/\.\.\.$/, "")
      .trim();
    const pTitle = cleanTitle.match(
      /\b(?:to|ke|in|di|for|keliling)\s+([A-Z][A-Za-z\s]+?)(?:\s+(?:with|for|pada|selama|dengan|budget|under)|\s*[,.?!]|$)/i
    );
    if (pTitle) {
      destination = pTitle[1].trim();
    } else if (!/^(?:plan|buatkan|bantu|rencana|new\s+conversation)\b/i.test(cleanTitle)) {
      destination = cleanTitle;
    }
  }

  // Priority 5: Fallback to arrival city from Day 1 header if nothing else matched
  if (!destination) {
    const firstLines = aiText.split("\n").slice(0, 8).join("\n");
    const pFallback = firstLines.match(
      /(?:^|\n)##?\s+.*?\b(?:to|in|ke|di)\s+([A-Z][A-Za-z0-9\s,.-]+?)(?:\s+[-–—:|]|\s*\n|$)/i
    );
    if (pFallback) {
      destination = pFallback[1].trim();
    }
  }

  // Clean destination string from trailing modifier noise
  if (destination) {
    destination = destination
      .replace(/\s+(?:with|for|and|pada|selama|dengan|budget|itinerary|trip|tour|focusing|focus|fokus)\b.*$/i, "")
      .replace(/^[#*\s-]+|[#*\s-]+$/g, "")
      .trim();
  }

  return { destination, days, budget, travelStyle };
}
