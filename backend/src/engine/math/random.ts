export const random = {
  /** Randomly pick a number between `min` and `max` (included) */
  range: (min: number, max: number, decimals = 0): number => {
    const precision = Math.pow(10, decimals)
    return min + (Math.floor(precision * Math.random() * (max - min)) / precision)
  },

  /** Randomly choose one entry in `values` */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  choose: (...values: any[]): any => {
    return values.flatMap(x => x)[random.range(0, values.length - 1)]
  },

  /** Return `true` with the probability of `percent`/100 chance */
  chance: (percent: number): boolean => Math.round(Math.random() * 100) / 100 <= percent / 100,
} as const
