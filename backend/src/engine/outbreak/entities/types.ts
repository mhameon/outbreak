import { Tile, Direction, Coords } from '#engine/types'

export type EntityId = string

export enum EntityType {
  'Zombie' = Tile.Zombie,
  'Human' = Tile.Human,
  'Sound' = Tile.Sound
}

export enum Attitude {
  /** (Default) Walks straight ahead, randomly changes direction (45° steps) when encountering an obstacle or stimulus */
  'Wandering',
  /** Has a target in line of sight and tries to reach it to attack it. Emit a sound (growl) when detecting it */
  'Tracking',
  /** Following a target detected by his scent */
  'Sniffing',
}

export type BaseEntity = {
  id: EntityId
  at: Coords
  type: EntityType
}

export type Entity = BaseEntity & EntityProperties

export type WithFacing = {
  facing: Direction
}

export type WithAttitude = {
  attitude: Attitude
}

export type WithVolume = {
  volume: number
}

export type EntityProperties = Partial<WithFacing> & Partial<WithAttitude> & Partial<WithVolume>

// -- Entities ---------------------------------------------------------------------------------------------------------
export type Zombie = Entity & WithFacing & WithAttitude
export type Sound = Entity & WithVolume
