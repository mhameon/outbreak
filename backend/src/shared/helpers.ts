/* eslint-disable @typescript-eslint/no-explicit-any */

import { OneOrMany } from '@shared/types'

type Functions = Array<(...args: any[]) => any>

export const pipe = (value: any): any => (...pipeline: Functions) => {
  return pipeline.reduce((val, func) => func(val), value)
}

export function toArray<T> (item: OneOrMany<T>): Array<T> {
  return ([] as T[]).concat(item instanceof Set ? [ ...item ] : item)
}

export function toSet<T> (item: OneOrMany<T>): Set<T> {
  return new Set(item instanceof Set ? item : toArray<T>(item))
}

/**
 * Returns a new Set based on `set` where all items existing in `without` have been removed
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deleteInSet<T extends Set<any>> (set: T, without: T): T {
  const result = new Set(set) as T
  without.forEach(it => result.delete(it))
  return result
}
