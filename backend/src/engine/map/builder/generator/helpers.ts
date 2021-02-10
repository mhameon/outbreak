/* eslint-disable @typescript-eslint/no-explicit-any */

import { Coords, Matrix, Matrix2d } from '@engine/type/outbreak'
import { validate } from '@shared/validator'
import chalk from 'chalk'
import { isMatrix2d, isNumber } from '@engine/map/guards'

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

  /** Has a `percent` in 100 chance of returning `true` */
  chance: (percent: number): boolean => Math.random() > percent / 100,
}

export const matrix = {
  min: (array: Matrix): number => Math.min(...array.map(e => Array.isArray(e) ? matrix.min(e) : e)),
  max: (array: Matrix): number => Math.max(...array.map(e => Array.isArray(e) ? matrix.max(e) : e)),

  /** Apply Math.abs() on all Matrix entries. Noise maps becomes "sharper". */
  sharpen: (array: Matrix): Matrix => {
    const absolutize = (entry: MatrixEntry): MatrixEntry => {
      return isNumber(entry) ? Math.abs(entry) : entry.map(absolutize)
    }

    return array.map(absolutize)
  },

  /** Normalize a Matrix (converts all entries to values between 0 to 1 with magnitude scale conservation) */
  normalize: (array: Matrix): Matrix => {
    const min = matrix.min(array)
    const max = matrix.max(array)
    const delta = max - min

    const normalizer = (entry: MatrixEntry): MatrixEntry => {
      return isNumber(entry)
        ? delta === 0 ? min : (entry - min) / delta
        : entry.map(normalizer)
    }

    return array.map(normalizer)
  },

  /** Cap a Matrix with floor/ceil values */
  cap: (array: Matrix, floor: number, ceil: number): Matrix => {
    const caper = (entry: MatrixEntry): MatrixEntry => {
      if (isNumber(entry)) {
        if (entry < floor) return floor
        if (entry > ceil) return ceil
        return entry
      }
      return entry.map(caper)
    }

    return array.map(caper)
  },

  /** Add `value` to all matrix entries **/
  add: (array: Matrix, value: number): Matrix => {
    const threshold = value > 0 ? matrix.max(array) : matrix.min(array)
    //const min = matrix.max(array)
    // if (isNumber(value)) {
    //   const adder = (entry: MatrixEntry): MatrixEntry => {
    //     return isNumber(entry) ? entry + (value as number) : entry.map(adder)
    //   }
    //
    //   return array.map(adder)
    // } else {
    //   //todo add another matrix
    // }
    //return []

    const adder = (entry: MatrixEntry): MatrixEntry => {
      if (isNumber(entry)) {
        const newValue = entry + value
        if (value > 0) {
          return newValue > threshold ? threshold : newValue
        }
        return newValue < threshold ? threshold : newValue
      }
      return entry.map(adder)
    }

    return array.map(adder)
  },

  inverse: (array: Matrix): Matrix => {
    const max = matrix.max(array)
    const reverser = (entry: MatrixEntry): MatrixEntry => {
      return isNumber(entry) ? max - entry : entry.map(reverser)
    }
    return array.map(reverser)
  },

  /** Call callback for each matrix entries **/
  travel: (array: Matrix | Matrix2d, callback: (entry: { coords: Coords; value: number }) => void): void => {
    validate(array, isMatrix2d)

    let x = 0, y = 0
    const traveler = (entry: MatrixEntry): void => {
      if (isNumber(entry)) {
        callback({ coords: { x, y }, value: entry })
        x++
      }
      else {
        entry.forEach(traveler)
        x = 0
        y++
      }
    }

    array.forEach(traveler)
  },

  /**
   * Return a console friendly version of the matrix
   * @param array
   * @param colorize
   * @return string
   */
  debug: (array: Matrix | Matrix2d, colorize?: Condition): string => {
    validate(array, isMatrix2d)

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
        lte: '≤',
      }
      needColorization = (value: number): boolean => checker[comparator](value)

      output += ` ${symbols[comparator]}${value}`
    }

    output += '\n'
    // if (width === 0 || height === 0) {
    //   throw new Error('Cannot render empty matrix !')
    // }

    let item: number
    let rgb: number
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        item = (array[y] as number[])[x]
        if (needColorization(item)) {
          output += chalk.bgRgb(Math.round(200 * item), 0, 0).red(item <= 0.1 ? '‧' : ' ')
        }
        else {
          rgb = Math.round(255 * item)
          output += chalk.bgRgb(rgb, rgb, rgb)(' ')
        }
      }
      output += '\n'
    }
    return output
  },
}

