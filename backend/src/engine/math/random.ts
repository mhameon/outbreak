export const random = {
  /** Randomly pick a number between `min` and `max` (included) */
  range: (min: number, max: number, decimals = 0): number => {
    const precision = Math.pow(10, decimals)
    return Math.floor(precision * Math.random() * (max - min + 1) + min) / precision
  },

  /** Randomly choose one entry in `values` */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  choose: (...values: any[]): any => values[random.range(0, values.length - 1)],

  /** Has a `percent` in 100 chance of returning `true` */
  chance: (percent: number): boolean => Math.round(Math.random() * 100) / 100 <= percent / 100,
} as const
