/* eslint-disable @typescript-eslint/no-explicit-any */
import { OneOrMany, Primitive } from '#common/types'
import config from 'config'

type Functions = Array<(...args: any[]) => any>
export const pipe = (value: any): any => (...pipeline: Functions) => {
  return pipeline.reduce((val, func) => func(val), value)
}

/**
 * Convert anything into Array
 */
export function toArray<T> (item: OneOrMany<T>): Array<T> {
  return ([] as T[]).concat(item instanceof Set ? [ ...item ] : item)
}

/**
 * Convert anything into Set
 */
export function toSet<T> (item: OneOrMany<T>): Set<T> {
  return new Set(item instanceof Set ? item : toArray<T>(item))
}

/**
 * Returns a new Set based on `set` purged of all `without` items
 */
export function deleteInSet<T extends Set<Primitive>> (set: T, without: T): T {
  const purged = new Set(set) as T
  without.forEach(it => purged.delete(it))
  return purged
}

export function isEnv (env: 'development' | 'production' | 'testing'): boolean {
  return config.util.getEnv('NODE_ENV') === env
}
