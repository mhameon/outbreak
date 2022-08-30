/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Ensure unknown variable is an object
 */
export function isObject (obj: unknown): obj is Record<string, any> {
  return obj !== null && typeof obj === 'object'
}
