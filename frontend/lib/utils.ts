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
