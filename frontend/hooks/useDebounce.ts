import { useState, useEffect } from "react";

/**
 * Custom hook that delays updating value until after a specified debounce interval.
 * Essential for text inputs, real-time search filters, and expensive recalculations.
 *
 * @param value The reactive input value to debounce
 * @param delayMs Milliseconds to wait before updating (default: 200ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delayMs: number = 200): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
