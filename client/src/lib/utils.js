/**
 * Utility functions for the application
 */

import { clsx } from 'clsx';

/**
 * Combines class names using clsx
 * Used for conditional className management with Tailwind CSS
 *
 * @param {...any} inputs - Class names to combine
 * @returns {string} Combined class names
 */
export function cn(...inputs) {
  return clsx(inputs);
}

