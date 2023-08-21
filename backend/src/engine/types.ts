import { Values } from '#common/types'

export type Coords = { x: number; y: number }

/**
 * ```
 *   315°     0°     45°
 *      NW    N    NE
 *        ↖   ↑   ↗
 *          0 1 2
 * 270° W ← 3 · 4 → E 90°
 *          5 6 7
 *        ↙   ↓   ↘
 *      SW    S    SE
 *   225°    180°    135°
 * ```
 */
export enum Direction {
  NorthWest,
  North,
  NorthEast,
  West,
  East,
  SouthWest,
  South,
  SouthEast
}

/**
 * Use this dictionary to convert a `Direction` in degrees
 * @example
 * DirectionInDegree[Direction.NorthEast] // will give you 45°
 * */
export const DirectionInDegree = [ 315, 0, 45, 270, 90, 225, 180, 135 ] as const

/**
 * Use this dictionary to convert a clockwise pos to `Direction`
 * @example
 * DirectionClockwise[0] // will give you Direction.North
 * @see Direction
 */
export const DirectionClockwise = [ 1, 2, 4, 7, 6, 5, 3, 0 ] as const

export type BuildingLevel = 'Level1' | 'Level2' | 'Level3' | 'Level4' | 'Level5'

export enum Tile {
  /*** Properties ***/
  Walkable,
  Block,
  TemporaryBlock,
  Sound,

  /*** Sidekick tiles ***/
  Burned = 10,
  Burning,

  Level1,
  Level2,
  Level3,
  Level4,
  Level5,

  /*** Entities ***/
  Zombie = 50,
  Human,

  /*** Materials ***/
  Grass = 100,
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
  BurnedBuildingL5,
  Zombie,
  Human,
  Sound
}

export type Index = `${number},${number}`
export type Tileset = Set<Tile>
export type InMapTileset = { at: Coords; tileset: Tileset }

export type Around = Map<Values<typeof Direction>, Tileset>

// export const GAME_ID_PREFIX = 'game_'
// export type GameId = `${typeof GAME_ID_PREFIX}${string}`
export { GAME_ID_PREFIX } from '#shared/types'
export type { GameId } from '#shared/types'

export type Seed = number | string

/** A matrix is an array of numbers of N dimensions */
export type Matrix = Array<Matrix | number> // Recursive type
export type Matrix2d = number[][]

export type WindSettings = {
  /** Wind's angle in degrees, 0° is North, clockwise */
  angle: number
  /**
   * Wind force (0-10): 0 - no spread, 10 - 100% flame spread
   */
  force: number
}
