/**
 * Check if value is a valid number (not null, undefined, NaN, or Infinity)
 *
 * @param value - Value to check
 * @returns Whether value is a valid finite number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Format currency for Vietnamese Dong display
 * Handles null, undefined, NaN, and Infinity gracefully
 *
 * @param value - Number to format
 * @param fallback - Fallback string for invalid values (default: '0 đ')
 * @returns Formatted currency string
 */
export function formatCurrency(value: number | null | undefined, fallback: string = '0 đ'): string {
  // Handle invalid values
  if (value === null || value === undefined || !isValidNumber(value)) {
    return fallback;
  }

  // Handle negative values
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const prefix = isNegative ? '-' : '';

  if (absValue >= 1e9) {
    return `${prefix}${(absValue / 1e9).toFixed(2)} tỷ`;
  }
  if (absValue >= 1e6) {
    return `${prefix}${(absValue / 1e6).toFixed(1)} triệu`;
  }
  return `${prefix}${new Intl.NumberFormat('vi-VN').format(absValue)} đ`;
}

/**
 * Format number with Vietnamese locale
 * Handles null, undefined, NaN, and Infinity gracefully
 *
 * @param value - Number to format
 * @param fallback - Fallback string for invalid values (default: '0')
 * @returns Formatted number string
 */
export function formatNumber(value: number | null | undefined, fallback: string = '0'): string {
  // Handle invalid values
  if (value === null || value === undefined || !isValidNumber(value)) {
    return fallback;
  }

  return new Intl.NumberFormat('vi-VN').format(Math.round(value));
}

/**
 * Format percentage
 * Handles edge cases and invalid values
 *
 * @param value - Number to format as percentage
 * @param decimals - Number of decimal places
 * @param fallback - Fallback string for invalid values
 * @returns Formatted percentage string
 */
export function formatPercent(
  value: number | null | undefined,
  decimals: number = 2,
  fallback: string = '0%'
): string {
  if (value === null || value === undefined || !isValidNumber(value)) {
    return fallback;
  }

  return `${value.toFixed(decimals)}%`;
}

/**
 * Clamp a value between min and max
 * Validates that min <= max and handles edge cases
 *
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  // Handle invalid inputs
  if (!isValidNumber(value)) return min;
  if (!isValidNumber(min) || !isValidNumber(max)) return value;

  // Ensure min <= max
  const actualMin = Math.min(min, max);
  const actualMax = Math.max(min, max);

  return Math.min(Math.max(value, actualMin), actualMax);
}

/**
 * Deep clone an object using JSON serialization
 * Note: This loses functions, Dates become strings, and circular refs will throw
 *
 * @param obj - Object to clone
 * @returns Deep cloned object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    // If JSON serialization fails (e.g., circular reference), return shallow copy
    if (Array.isArray(obj)) {
      return [...obj] as T;
    }
    if (typeof obj === 'object') {
      return { ...obj };
    }
    return obj;
  }
}

/**
 * Generate a simple unique ID
 * Note: Not cryptographically secure, use only for UI purposes
 *
 * @param length - Desired length of ID (default: 9)
 * @returns Unique ID string
 */
export function generateId(length: number = 9): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Debounce a function with optional cancel and flush methods
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function with cancel and flush methods
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void; flush: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
      lastArgs = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  debounced.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      fn(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debounced;
}

/**
 * Parse a string to number with fallback
 * Handles Vietnamese number format (1.234,56)
 *
 * @param value - String to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed number or fallback
 */
export function parseNumberWithFallback(value: string | null | undefined, fallback: number): number {
  if (value === null || value === undefined || value.trim() === '') {
    return fallback;
  }

  // Try parsing as-is first
  let parsed = parseFloat(value);
  if (isValidNumber(parsed)) {
    return parsed;
  }

  // Try Vietnamese format (1.234,56 -> 1234.56)
  const vietnameseFormat = value.replace(/\./g, '').replace(',', '.');
  parsed = parseFloat(vietnameseFormat);

  return isValidNumber(parsed) ? parsed : fallback;
}

/**
 * Class names utility (similar to clsx/classnames)
 *
 * @param classes - Class names to combine
 * @returns Combined class string
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format a date to Vietnamese locale
 *
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }
): string {
  if (date === null || date === undefined) {
    return '';
  }

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    return new Intl.DateTimeFormat('vi-VN', options).format(dateObj);
  } catch {
    return '';
  }
}

/**
 * Throttle a function
 *
 * @param fn - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
