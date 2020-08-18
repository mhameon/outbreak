/* eslint-disable @typescript-eslint/no-explicit-any */
import { Coords } from './outbreak'

export function isCoords (arg: any): arg is Coords {
  return arg.x !== undefined && arg.y !== undefined
}

export function isCoordsArray (arg: any): arg is Array<Coords> {
  return arg.length > 0 && isCoords(arg[0])
}

export function isNumber (arg: any): arg is number {
  return typeof arg === 'number'
}
