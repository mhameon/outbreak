/* eslint-disable @typescript-eslint/no-explicit-any */
import { WorldMap } from '#engine/map/WorldMap'
import { Coords, Matrix2d, Index } from './types'
import { isObject } from '#shared/guards'
import { EntityType } from '#engine/outbreak/entities/types'

export function isNumber (arg: any): arg is number {
  return !isNaN(+arg)
}

// ArrayLike<unknown>) required in TS 4.8
//const isSomeEnum = <T> (e: T) => (token: unknown): token is T[keyof T] => Object.values(e as ArrayLike<unknown>).includes(token as T[keyof T])
const isSomeEnum = <T> (e: T) => (token: unknown): token is T[keyof T] => Object.values(e).includes(token as T[keyof T])

export function isCoords (coords: unknown): coords is Coords {
  return isObject(coords) && isNumber(coords.x) && isNumber(coords.y)
}

const indexRegexp = new RegExp(/^\d,\d$/)

export function isIndex (arg: any): arg is Index {
  return indexRegexp.test(arg)
}

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

export const isEntityType = isSomeEnum(EntityType)
