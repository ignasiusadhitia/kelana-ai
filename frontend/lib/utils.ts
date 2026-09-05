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
  const days = Math.max(1, Math.min(rawDays, 30));

  // 2. TRAVEL STYLE
  const textLower = combined.toLowerCase();
  let travelStyle = defaultStyle || "Family";
  if (/(?:backpacker|hemat|hostel|budget\s+traveler)/i.test(textLower)) {
    travelStyle = "Backpacker";
  } else if (/(?:couple|honeymoon|pasangan|romantic|romantis)/i.test(textLower)) {
    travelStyle = "Couple";
  } else if (/(?:luxury|mewah|5-star|five-star|resort|premium)/i.test(textLower)) {
    travelStyle = "Luxury";
  } else if (/(?:adventure|petualang|hiking|trekking|outdoor|nature)/i.test(textLower)) {
    travelStyle = "Adventure";
  } else if (/(?:culinary|kuliner|street\s+food|foodie|makanan|dining)/i.test(textLower)) {
    travelStyle = "Culinary";
  } else if (/(?:wellness|spa|relax|santai|healing|meditation)/i.test(textLower)) {
    travelStyle = "Wellness";
  } else if (/(?:solo|sendiri|me\s+time)/i.test(textLower)) {
    travelStyle = "Solo";
  } else if (/(?:family|keluarga|anak|kids|children)/i.test(textLower)) {
    travelStyle = "Family";
  }

  // 3. BUDGET (USD)
  let budget = 1500;
  const totalBudgetMatch = combined.match(
    /(?:total\s*(?:estimated\s*)?budget|estimated\s*budget|total\s*biaya|total\s*cost)[\s:]*~?\s*(?:(?:USD|\$|Rp\.?|IDR)\s*)?([0-9][0-9,.]*)/i
  );
  const promptBudgetMatch = combined.match(
    /(?:budget|biaya|anggaran)(?:\s*(?:of|is|sebesar|sekitar|:))?\s*~?\s*(?:(?:USD|\$|Rp\.?|IDR)\s*)?([0-9][0-9,.]*)/i
  );
  const dollarMatch = userPrompt.match(/(?:USD|\$)\s*([0-9][0-9,]*)/i);
  const trailingDollarMatch = userPrompt.match(/([0-9][0-9,]*)\s*(?:USD|dollar|dolar)\b/i);

  const rawBudgetStr =
    totalBudgetMatch?.[1] || promptBudgetMatch?.[1] || dollarMatch?.[1] || trailingDollarMatch?.[1];
  if (rawBudgetStr) {
    const num = parseInt(rawBudgetStr.replace(/[,.]/g, ""), 10);
    if (!isNaN(num) && num >= 50 && num <= 100000) {
      budget = num;
    }
  }

  // 4. DESTINATION
  let destination = "";
  const firstLines = aiText.split("\n").slice(0, 8).join("\n");

  // Pattern 1: ## ... to/in/ke/di [Destination] (e.g. ## 5-Day Family Trip to Kazakhstan)
  const p1 = firstLines.match(
    /(?:^|\n)##?\s+.*?\b(?:to|in|ke|di)\s+([A-Z][A-Za-z0-9\s,.-]+?)(?:\s+[-–—:|]|\s*\n|$)/i
  );
  if (p1) {
    destination = p1[1].trim();
  }

  // Pattern 2: ## [Destination] [N]-Day Itinerary
  if (!destination) {
    const p2 = firstLines.match(
      /(?:^|\n)##?\s+([A-Z][A-Za-z\s]+?)\s+\d+[\s-]*(?:days?|hari)\b/i
    );
    if (p2) destination = p2[1].trim();
  }

  // Pattern 3: user prompt ... to/ke/in/di [Destination] (e.g. Plan a 5-day trip to Kazakhstan)
  if (!destination && userPrompt) {
    const p3 = userPrompt.match(
      /\b(?:to|ke|in|di)\s+([A-Z][A-Za-z\s]+?)(?:\s+(?:with|for|pada|selama|dengan|budget|under|using|ala)|\s*[,.?!]|$)/i
    );
    if (p3) destination = p3[1].trim();
  }

  // Pattern 4: conversation title fallback
  if (!destination && conversationTitle) {
    const cleanTitle = conversationTitle
      .replace(/^(?:Chat:\s*|Trip:\s*)/i, "")
      .replace(/\.\.\.$/, "")
      .trim();
    const p4 = cleanTitle.match(
      /\b(?:to|ke|in|di)\s+([A-Z][A-Za-z\s]+?)(?:\s+(?:with|for|pada|selama|dengan|budget|under)|\s*[,.?!]|$)/i
    );
    if (p4) {
      destination = p4[1].trim();
    } else if (!/^(?:plan|buatkan|bantu|rencana|new\s+conversation)\b/i.test(cleanTitle)) {
      destination = cleanTitle;
    }
  }

  // Clean destination string from trailing modifier noise
  if (destination) {
    destination = destination
      .replace(/\s+(?:with|for|and|pada|selama|dengan|budget|itinerary|trip|tour)\b.*$/i, "")
      .replace(/^[#*\s-]+|[#*\s-]+$/g, "")
      .trim();
  }

  return { destination, days, budget, travelStyle };
}

