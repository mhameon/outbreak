/* eslint-disable @typescript-eslint/no-explicit-any */
import { WorldMap } from '#engine/map/WorldMap'
import type { Coords, Matrix2d, Index } from '#engine/types'
import { type GameId, GAME_ID_PREFIX } from '#shared/types'
import { isObject, isNumber } from '#common/guards'
import { EntityType } from '#engine/outbreak/entities/types'

const isSomeEnum = <T extends {
  [n: number | string]: unknown
}> (enumType: T) => (token: unknown): token is T[keyof T] => Object.values(enumType).includes(token as T[keyof T])

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

export function isGameId (name: unknown): name is GameId {
  return typeof name === 'string' && name.startsWith(GAME_ID_PREFIX)
}

export const isEntityType = isSomeEnum(EntityType)
