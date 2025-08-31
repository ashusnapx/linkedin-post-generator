// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind-friendly className combiner.
 * Uses clsx for conditional joining and twMerge for deduplication.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Helper to extract first value from slider value array or fallback.
 */
export function one(
  arr: number[] | readonly number[] | undefined,
  fallback = 0.6
): number {
  if (!arr || arr.length === 0) return fallback;
  return arr[0];
}
