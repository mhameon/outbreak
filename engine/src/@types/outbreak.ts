export type Coords = {
  x: number
  y: number
}

export function isCoords (arg: any): arg is Coords {
  return arg.x !== undefined && arg.y !== undefined
}

export function isCoordsArray (arg: any): arg is Array<Coords> {
  return arg.length > 0 && isCoords(arg[0])
}

export type Size = {
  width: number
  height: number
}

export const enum Tile {
  /*** Properties ***/
  Walkable,
  Block,

  /*** Cosmetic ***/
  Road,
  Water,
}

export type Index = string
export type Tileset = Set<Tile>
export type Around = Map<Direction, Tileset>

export const enum Direction {
  NorthWest,
  North,
  NorthEast,
  West,
  East,
  SouthWest,
  South,
  SouthEast
}

export type GameId = string
