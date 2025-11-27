/**
 * Format currency for Vietnamese Dong display
 *
 * @param value - Number to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)} ty`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(1)} trieu`;
  }
  return new Intl.NumberFormat('vi-VN').format(value) + ' d';
}

/**
 * Format number with Vietnamese locale
 *
 * @param value - Number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(value));
}

/**
 * Format percentage
 *
 * @param value - Number to format as percentage
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Clamp a value between min and max
 *
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Deep clone an object
 *
 * @param obj - Object to clone
 * @returns Deep cloned object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Generate a simple unique ID
 *
 * @returns Unique ID string
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Debounce a function
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Check if value is a valid number
 *
 * @param value - Value to check
 * @returns Whether value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Parse a string to number with fallback
 *
 * @param value - String to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed number or fallback
 */
export function parseNumberWithFallback(value: string, fallback: number): number {
  const parsed = parseFloat(value);
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
