export type Coords = {
  x: number
  y: number
}

/**
 * ```
 *  NW    N    NE
 *    ↖   ↑   ↗
 *      0 1 2
 *  W ← 3 · 4 → E
 *      5 6 7
 *    ↙   ↓   ↘
 *  SW    S   SE
 * ```
 */
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

export type Size = {
  width: number
  height: number
}

export type TileLevel = 'Level0' | 'Level1' | 'Level2' | 'Level3' | 'Level4' | 'Level5'
export enum Tile {
  /*** Properties ***/
  Walkable,
  Block,

  Level0,
  Level1,
  Level2,
  Level3,
  Level4,
  Level5,

  /*** Cosmetic ***/
  Road,
  Water,
  Building,
}

export type Index = string
export type Tileset = Set<Tile>

export type Around = Map<Direction, Tileset>

export type GameId = string

export type Seed = number | string

/** A matrix is an array of numbers of N dimensions */
export type Matrix = Array<Matrix | number> // Recursive type

export type Matrix1d = number[]
export type Matrix2d = number[][]
