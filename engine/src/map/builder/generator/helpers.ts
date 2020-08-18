/* eslint-disable @typescript-eslint/no-explicit-any */

import { Matrix } from '../../../@types/outbreak'
import chalk from 'chalk'
import { isNumber } from '../../../@types/guards'

type MatrixEntry = Matrix | number
type Comparators = 'eq' | 'gt' | 'gte' | 'lt' | 'lte'
type Condition = { [K in Comparators]?: number }

export const random = {
  /** Randomly pick a number between `min` and `max` (included) */
  range: (min: number, max: number, decimals = 0): number => {
    const precision = Math.pow(10, decimals)
    return Math.floor(precision * Math.random() * (max - min + 1) + min) / precision
  },

  /** Randomly choose one entry in `values` */
  choose: (...values: any[]): any => values[random.range(0, values.length - 1)],

  chance: (percent: number): boolean => Math.random() > percent / 100
}

export const matrix = {
  min: (array: Matrix): number => Math.min(...array.map(e => Array.isArray(e) ? matrix.min(e) : e)),
  max: (array: Matrix): number => Math.max(...array.map(e => Array.isArray(e) ? matrix.max(e) : e)),

  /** Apply Math.abs() on all Matrix entries. Noise maps becomes "sharper". */
  sharpen: (array: Matrix): Matrix => {
    function absolutize (entry: MatrixEntry): MatrixEntry {
      return isNumber(entry) ? Math.abs(entry) : entry.map(absolutize)
    }

    return array.map(absolutize)
  },

  /** Normalize a Matrix (converts entries between 0 and 1 with magnitude scale conservation) */
  normalize: (array: Matrix): Matrix => {
    const min = matrix.min(array)
    const max = matrix.max(array)
    const delta = max - min

    function normalizer (entry: MatrixEntry): MatrixEntry {
      return isNumber(entry)
        ? delta === 0 ? min : (entry - min) / delta
        : entry.map(normalizer)
    }

    return array.map(normalizer)
  },

  /** Cap a Matrix with floor/ceil values */
  cap: (array: Matrix, floor: number, ceil: number): Matrix => {
    function caper (entry: MatrixEntry): MatrixEntry {
      if (isNumber(entry)) {
        if (entry < floor) return floor
        if (entry > ceil) return ceil
        return entry
      }
      return entry.map(caper)
    }

    return array.map(caper)
  },

  add: (array: Matrix, value: Matrix | number): Matrix => {
    if (isNumber(value)) {
      // eslint-disable-next-line no-inner-declarations
      const adder = (entry: MatrixEntry): MatrixEntry => {
        return isNumber(entry) ? entry + (value as number) : entry.map(adder)
      }

      return array.map(adder)
    } else {
      //todo add another matrix
    }
    return []
  },

  debug: (array: Matrix, colorize?: Condition): string => {
    const height = array.length
    const width = array[0] ? (array[0] as number[]).length : 0
    let output = `${width}x${height}`
    output += ` (min=${matrix.min(array)}, max=${matrix.max(array)})`

    let needColorization = (value: number): boolean => false
    if (colorize) {
      const comparator = Object.keys(colorize)[0] as Comparators
      const value = colorize[comparator] as number
      const checker = {
        eq: (v: number) => v == value,
        gt: (v: number) => v > value,
        gte: (v: number) => v >= value,
        lt: (v: number) => v < value,
        lte: (v: number) => v <= value,
      }
      const symbols = {
        eq: '=',
        gt: '>',
        gte: '≥',
        lt: '<',
        lte: '≤'
      }
      needColorization = (value: number): boolean => checker[comparator](value)

      output += ` ${symbols[comparator]}${value}`
    }

    output += '\n'
    if (width === 0 || height === 0) {
      return 'Cannot render empty matrix !'
    }

    let item: number
    let rgb: number
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        item = (array[y] as number[])[x]
        if (needColorization(item)) {
          output += chalk.bgRgb(Math.round(200 * item), 0, 0).red(item <= 0.1 ? '‧' : ' ')
        } else {
          rgb = Math.round(255 * item)
          output += chalk.bgRgb(rgb, rgb, rgb)(' ')
        }
      }
      output += '\n'
    }
    return output
  },
}

