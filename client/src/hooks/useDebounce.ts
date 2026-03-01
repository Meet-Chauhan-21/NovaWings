// src/hooks/useDebounce.ts
// Returns a debounced version of the provided value

import { useState, useEffect } from "react";

/**
 * Debounces a value by the specified delay (ms).
 * @param value - The value to debounce
 * @param delay - Debounce delay in milliseconds (default 300)
 * @returns The debounced value
 */
export default function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
