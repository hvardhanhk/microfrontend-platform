import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes without conflicts.
 * clsx handles conditional classes; twMerge deduplicates conflicting utilities
 * (e.g., "px-4 px-6" → "px-6").
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
