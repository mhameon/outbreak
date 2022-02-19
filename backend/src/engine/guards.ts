/* eslint-disable @typescript-eslint/no-explicit-any */
import { WorldMap } from '#engine/map/WorldMap'
import { Coords, Matrix2d } from './types'
import { CreatureType } from '#engine/outbreak/entities/CreatureManager'

export function isNumber (arg: any): arg is number {
  return !isNaN(+arg)
}

const isSomeEnum = <T> (e: T) => (token: any): token is T[keyof T] => Object.values(e).includes(token as T[keyof T])

export function isCoords (arg: any): arg is Coords {
  const coords: Coords = arg
  return isNumber(coords?.x) && isNumber(coords?.y)
}

// TODO: Keep?
export function isCoordsArray (arg: any): arg is Array<Coords> {
  const coordsArray: Array<Coords> = arg
  return coordsArray.length > 0 && isCoords(coordsArray[0])
}

export function isMatrix2d (arg: any): arg is Matrix2d {
  const matrix: Matrix2d = arg
  return matrix.length > 0 && matrix[0].length > 0 && isNumber(matrix[0][0])
}

export function isWorldMap (arg: any): arg is WorldMap {
  return arg instanceof WorldMap
}

export const isCreatureType = isSomeEnum(CreatureType)
