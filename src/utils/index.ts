import { fileURLToPath } from 'node:url';
import { dirname } from 'pathe';
import type { RegionCode } from '../constants';
import { regions } from '../constants';

export * from './error/';
export * from './konsola';
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export function isRegion(value: RegionCode): value is RegionCode {
  return Object.values(regions).includes(value);
}

export function maskToken(token: string): string {
  // Show only the first 4 characters and replace the rest with asterisks
  if (token.length <= 4) {
    // If the token is too short, just return it as is
    return token;
  }
  const visiblePart = token.slice(0, 4);
  const maskedPart = '*'.repeat(token.length - 4);
  return `${visiblePart}${maskedPart}`;
}

export const slugify = (text: string): string =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/-{2,}/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '');

export const removePropertyRecursively = (obj: Record<string, any>, property: string): Record<string, any> => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removePropertyRecursively(item, property));
  }

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key !== property) {
      result[key] = removePropertyRecursively(value, property);
    }
  }
  return result;
};

/**
 * Converts an object with potential non-string values to an object with string values
 * for use with URLSearchParams
 *
 * @param obj - The object to convert
 * @returns An object with all values converted to strings
 */
export const objectToStringParams = (obj: Record<string, any>): Record<string, string> => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    // Skip undefined values
    if (value === undefined) { return acc; }

    // Convert objects/arrays to JSON strings
    if (typeof value === 'object' && value !== null) {
      acc[key] = JSON.stringify(value);
    }
    else {
      // Convert other types to strings
      acc[key] = String(value);
    }
    return acc;
  }, {} as Record<string, string>);
};

export const isVitest = process.env.VITEST === 'true';

/**
 * Creates a regex pattern from a glob pattern
 * @param pattern - The glob pattern to convert
 * @returns A regex that matches the glob pattern
 */
export function createRegexFromGlob(pattern: string): RegExp {
  // Add ^ and $ to ensure exact match, escape the pattern to handle special characters
  return new RegExp(`^${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*')}$`);
}
