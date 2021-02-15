import { isMatrix2d, isNumber } from '@engine/map/guards'
import { Coords, Matrix, Matrix2d, Size } from '@engine/types'
import { validate } from '@shared/validator'
import chalk from 'chalk'

export type MatrixTransformer = (matrix: Matrix) => Matrix

type MatrixEntry = Matrix | number
type Comparators = 'eq' | 'gt' | 'gte' | 'lt' | 'lte'
type Condition = { [K in Comparators]?: number }


function add (value: number): MatrixTransformer
function add (value: number, array: Matrix): Matrix
/** Add `value` to all matrix entries **/
function add (value: number, array?: Matrix): Matrix | MatrixTransformer {
  if (array) {
    const adder = (entry: MatrixEntry): MatrixEntry => isNumber(entry) ? entry + value : entry.map(adder)
    return array.map(adder)
  }
  return (array: Matrix) => matrix.add(value, array) as Matrix
}

function cap (floor: number, ceil: number): MatrixTransformer
function cap (floor: number, ceil: number, array: Matrix): Matrix
/** Cap a Matrix with floor/ceil values */
function cap (floor: number, ceil: number, array?: Matrix): Matrix|MatrixTransformer {
  if ( array ) {
    const caper = (entry: MatrixEntry): MatrixEntry => {
      if (isNumber(entry)) {
        if (entry < floor) return floor
        if (entry > ceil) return ceil
        return entry
      }
      return entry.map(caper)
    }
    return array.map(caper)
  }
  return (array: Matrix) => matrix.cap(floor, ceil, array) as Matrix
}

export const matrix = {

  create: (size: Size, fill: number | ((x: number, y: number) => number)): Matrix2d => (
    Array.from({ length: size.height }, (_, y) =>
      Array.from({ length: size.width }, (_, x) => (
        fill instanceof Function ? fill(x, y) : fill
      )),
    )
  ),

  min: (array: Matrix): number => Math.min(...array.map(e => isNumber(e) ? e : matrix.min(e))),
  max: (array: Matrix): number => Math.max(...array.map(e => isNumber(e) ? e : matrix.max(e))),

  /**
   * Apply Math.abs() on all Matrix entries. Noise maps becomes "sharper".
   * Has no effect on normalized matrix (since only negative entries are affected)
   */
  sharpen: (array: Matrix): Matrix => {
    const absolutize = (entry: MatrixEntry): MatrixEntry => (
      isNumber(entry) ? Math.abs(entry) : entry.map(absolutize)
    )
    return array.map(absolutize)
  },

  sharpen2: (array: Matrix): Matrix => {
    const absolutize = (entry: MatrixEntry): MatrixEntry => (
      isNumber(entry) ? entry * entry : entry.map(absolutize)
    )
    return array.map(absolutize)
  },

  /** Normalize a Matrix (converts all entries to values between 0 to 1 with magnitude scale conservation) */
  normalize: (array: Matrix): Matrix => {
    const min = matrix.min(array)
    const max = matrix.max(array)
    const delta = max - min

    const normalizer = (entry: MatrixEntry): MatrixEntry => (
      isNumber(entry)
        ? delta === 0 ? min : (entry - min) / delta
        : entry.map(normalizer)
    )
    return array.map(normalizer)
  },

  /** Cap a Matrix with floor/ceil values */
  cap,

  /** Add `value` to all matrix entries **/
  add,

  inverse: (array: Matrix): Matrix => {
    const max = matrix.max(array)
    const reverser = (entry: MatrixEntry): MatrixEntry => (
      isNumber(entry) ? max - entry : entry.map(reverser)
    )
    return array.map(reverser)
  },

  /** Call callback() for each matrix entries */
  each: (callback: (entry: { coords: Coords; value: number }) => void, array: Matrix | Matrix2d): void => {
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
   */
  debug: (array: Matrix | Matrix2d, options: { colorize?: Condition } = {}): string => {
    validate(array, isMatrix2d)

    const height = array.length
    const width = array[0] ? (array[0] as number[]).length : 0
    let output = `${width}x${height}`
    output += ` (min=${matrix.min(array)}, max=${matrix.max(array)})`

    // noinspection JSUnusedLocalSymbols
    let needColorization = (value: number): boolean => false
    if (options.colorize) {
      const comparator = Object.keys(options.colorize)[0] as Comparators
      const value = options.colorize[comparator] as number
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

      output += chalk.red(` ${symbols[comparator]}${value}`)
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
} as const
