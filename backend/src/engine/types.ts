import { Values } from '@shared/types'

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
// https://fettblog.eu/tidy-typescript-avoid-enums/
export const Direction = {
  NorthWest: 0,
  North: 1,
  NorthEast: 2,
  West: 3,
  East: 4,
  SouthWest: 5,
  South: 6,
  SouthEast: 7
} as const

export type Size = {
  width: number
  height: number
}

export type BuildingLevel = 'Level1' | 'Level2' | 'Level3' | 'Level4' | 'Level5'

export enum Tile {
  /*** Properties (Sidekick tiles) ***/
  Walkable,
  Block,

  Burned,
  Burning,

  Level1,
  Level2,
  Level3,
  Level4,
  Level5,

  /*** Cosmetic ***/
  Grass,
  Forest,
  Road,
  Water,
  Building,
}

export enum RenderTile {
  Grass,
  BurningGrass,
  BurnedGrass,
  Forest,
  BurningForest,
  BurnedForest,
  Road,
  BurningRoad,
  BurnedRoad,
  Bridge,
  Water,
  Building,
  BuildingL1,
  BuildingL2,
  BuildingL3,
  BuildingL4,
  BuildingL5,
  BurnedBuilding,
  BurningBuildingL1,
  BurningBuildingL2,
  BurningBuildingL3,
  BurningBuildingL4,
  BurningBuildingL5,
  BurnedBuildingL1,
  BurnedBuildingL2,
  BurnedBuildingL3,
  BurnedBuildingL4,
  BurnedBuildingL5
}

export type Index = string
export type Tileset = Set<Tile>
export type Tiles = Tile | Tile[]
export type Square = { at: Coords; tileset: Tileset }

export type Around = Map<Values<typeof Direction>, Tileset>

export type GameId = string

export type Seed = number | string

/** A matrix is an array of numbers of N dimensions */
export type Matrix = Array<Matrix | number> // Recursive type

export type Matrix1d = number[]
export type Matrix2d = number[][]
