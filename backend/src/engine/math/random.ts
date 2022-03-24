import crypto from 'crypto'
import { Direction } from '#engine/types'

export const random = {
  /** Randomly pick a number between `min` and `max` (included) */
  range: (min: number, max: number, decimals = 0): number => {
    const precision = Math.pow(10, decimals)
    return crypto.randomInt(min * precision, (max + 1 / precision) * precision) / precision
  },

  /** Randomly choose one entry in `values` */
  choose: <T> (...values: T[]): T extends unknown[] ? T[number] : T => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const array: any = values.flatMap(x => x)
    const index = random.range(0, array.length - 1)
    return array[index]
  },
  /** Return `true` with the probability of `percent`/100 chance */
  chance: (percent: number): boolean => percent === 100 ? true : Math.round(Math.random() * 100) < percent,

  /** Generate a random hexadecimal string (string size = bytes*2) */
  hex: (bytes = 8): string => crypto.randomBytes(bytes).toString('hex'),

  direction: (): Direction => random.range(0, 7)
} as const
