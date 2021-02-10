/* eslint-disable @typescript-eslint/no-explicit-any */
import { Coords, Matrix2d } from '../type/outbreak'

export function isNumber (arg: any): arg is number {
  return !isNaN(+arg)
}

export function isCoords (arg: any): arg is Coords {
  return isNumber(arg.x) && isNumber(arg.y)
}

export function isCoordsArray (arg: any): arg is Array<Coords> {
  return arg.length > 0 && isCoords(arg[0])
}

export function isMatrix2d (arg: any): arg is Matrix2d {
  return arg.length > 0 && arg[0].length > 0 && isNumber(arg[0][0])
}
