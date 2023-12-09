/* eslint-disable @typescript-eslint/no-explicit-any */
import { OneOrMany } from '#common/types'
import config from 'config'
import { Direction, DirectionClockwise, DirectionInDegree } from '#engine/types'
import { InvalidArgumentError } from '#common/Errors'

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
 * Convert a "clockwise index" to a `Direction`
 * @see Direction
 */
export function toDirection (clockwiseIndex: number): Direction {
  if (clockwiseIndex < 0 && clockwiseIndex > 7) {
    throw new InvalidArgumentError('clockwiseIndex must be a number in [0, 7]')
  }
  return DirectionClockwise[clockwiseIndex]
}

/**
 * Convert a `Direction` to his value in degrees
 * @see Direction
 */
export function toDegrees (facing: Direction): number {
  return DirectionInDegree[facing]
}

/**
 * Returns a new Set based on `set` where all `without` items existing have been removed
 */
export function deleteInSet<T extends Set<any>> (set: T, without: T): T {
  const result = new Set(set) as T
  without.forEach(it => result.delete(it))
  return result
}

export function isEnv (env: 'development' | 'production' | 'testing'): boolean {
  return config.util.getEnv('NODE_ENV') === env
}
