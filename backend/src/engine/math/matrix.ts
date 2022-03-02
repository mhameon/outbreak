import { isMatrix2d, isNumber } from '#engine/guards'
import { Coords, Matrix, Matrix2d, Size } from '#engine/types'
import { validate } from '#shared/validator'
import chalk from 'chalk'
import { color, Gradient } from '#engine/math/color'

type MatrixEntry = Matrix | number

type MatrixDebuggingOptions = {
  colorize?: Condition
  display?: (value: number) => number | string
  heatmap?: {
    colors: Gradient
    ignore?: Array<number>
  }
}
type Comparators = 'eq' | 'gt' | 'gte' | 'lt' | 'lte'
type Condition = { [K in Comparators]?: number }
export type MatrixTransformer = (matrix: Matrix) => Matrix

function add (value: number): MatrixTransformer
function add (value: number, array: Matrix): Matrix
/** Add `display` to all matrix entries **/
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
function cap (floor: number, ceil: number, array?: Matrix): Matrix | MatrixTransformer {
  if (array) {
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

  min: (array: Matrix, ignore: Array<number> = []): number => Math.min(...array.map(e => isNumber(e) ? e : matrix.min(e, ignore))),
  max: (array: Matrix, ignore: Array<number> = []): number => Math.max(...array.filter(e => (isNumber(e) ? !ignore.includes(e) : true)).map(e => isNumber(e) ? e : matrix.max(e, ignore))),

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
    const pow = (entry: MatrixEntry): MatrixEntry => (
      isNumber(entry) ? entry * entry : entry.map(pow)
    )
    return array.map(pow)
  },

  /** Normalize a Matrix (converts all entries to values between 0 and 1 with magnitude scale conservation) */
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

  /** Add `display` to all matrix entries **/
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
      } else {
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
  debug: (array: Matrix | Matrix2d, options: MatrixDebuggingOptions = {}): string => {
    validate(array, isMatrix2d)

    let min = 0, max = 0, delta = 0
    const height = array.length
    const width = array[0] ? (array[0] as number[]).length : 0

    if (options.heatmap) {
      min = matrix.min(array, options.heatmap.ignore ?? [])
      max = matrix.max(array, options.heatmap.ignore ?? [])
      delta = max - min
    }

    let output = `${width}x${height}`
    output += ` (min=${min}, max=${max}${options?.heatmap?.ignore ? `, ignored=${options?.heatmap?.ignore}` : ''})`

    let needColorization = (_value: number): boolean => false
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

    let item: number
    let rgb: number
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        item = (array[y] as number[])[x]
        if (needColorization(item)) {
          output += chalk.bgRgb(Math.round(200 * item), 0, 0).red(item <= 0.1 ? '‧' : ' ')
        } else {
          const show = options.display ? options.display(item) : ' '
          if (options.heatmap) {
            const { r, g, b } = color.range(delta === 0 ? min : (item - min) / delta, options.heatmap.colors)
            output += chalk.bgRgb(r, g, b).hex('#000')(show)
          } else {
            rgb = Math.round(255 * item)
            output += chalk.bgRgb(rgb, rgb, rgb).hex('#000')(show)
          }

        }
      }
      output += '\n'
    }
    return output
  },
} as const
