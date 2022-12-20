import { Tile, Direction, Coords, Index } from '#engine/types'

export const QUERYABLE_ENTITY_ATTRIBUTES = [ 'at', 'type' ] as const

export type EntityId = string

export enum EntityType {
  'Zombie' = Tile.Zombie,
  'Human' = Tile.Human,
  'Sound' = Tile.Sound
}

export enum Attitude {
  /** (Default) Walks straight ahead, randomly changes direction (45° steps) when encountering an obstacle */
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

// -- Entities querying types ------------------------------------------------------------------------------------------
export type QueryableEntityAttribute = typeof QUERYABLE_ENTITY_ATTRIBUTES[number] extends keyof Entity ? typeof QUERYABLE_ENTITY_ATTRIBUTES[number] : never
export type QueryableEntityAttributeType = Entity[QueryableEntityAttribute]
export type QueryableEntityAttributeSanitizedType = Index | Exclude<Entity[QueryableEntityAttribute], Coords>

export type EntityQuery = {
  [K in QueryableEntityAttribute]?: QueryableEntityAttributeType
}

export type EntityQueryFilters = {
  [K in QueryableEntityAttribute]?: QueryableEntityAttributeType | Array<QueryableEntityAttributeType>
}


