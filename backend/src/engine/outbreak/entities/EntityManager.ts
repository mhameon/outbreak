import { EventEmitter } from '#shared/TypedEventEmitter'
import type { Coords, Index } from '#engine/types'
import { Direction, DirectionInDegree } from '#engine/types'
import type { Logger } from '#shared/logger/index'
import { Outbreak } from '#engine/outbreak/index'
import { random } from '#engine/math/index'
import { WorldMap } from '#engine/map/WorldMap'
import { isCoords, isEntityType, isCoordsArray } from '#engine/guards'
import { Nullable, OneOrMany } from '#shared/types'
import { toArray } from '#shared/helpers'
import { expect, NotFoundError } from '#shared/Errors'
import { calculateDestination, calculateDirection } from '#engine/math/geometry'
import { OutOfMapError } from '#engine/map/WorldMapErrors'
import assert from 'assert'
import { hasAttitudeProperty, hasFacingProperty, isEntityId } from '#engine/outbreak/entities/guards'
import { Entity, EntityProperties, Attitude, EntityType, EntityId } from '#engine/outbreak/entities/types'
import { EntityManagerEvents } from '#engine/events'

/**
 * Handle entities in an Outbreak and apply map constraints, lifecycle, etc.
 *
 * Emitted events:
 *
 * | Name               | Handler signature                  |
 * |--------------------|------------------------------------|
 * | `entity:spawned`   | (entity: Entity)                   |
 * | `entity:moved`     | ({ entity: Entity, from: Coords }) |
 */
export class EntityManager extends EventEmitter<EntityManagerEvents> {
  readonly log: Logger
  readonly outbreak: Outbreak
  private readonly entities = new Map<EntityId, Entity>()
  private readonly entityIdsByCoords = new Map<Index, Set<EntityId>>()
  private readonly entityIdsByTypes = new Map<EntityType, Set<EntityId>>()

  //todo generalize with entityIdsByAttributes

  constructor (outbreak: Outbreak) {
    super()
    this.log = outbreak.log.child({ label: this.constructor.name })
    this.outbreak = outbreak
  }

  spawn (type: EntityType, at: Coords, attributes?: EntityProperties): Readonly<Entity> {
    this.outbreak.map.assertMapContains(at)

    const entity: Entity = this.fillWithDefaultValues({
      ...attributes,
      id: random.hex(),
      at,
      type,
    })

    this.add(entity)

    this.log.debug('Entity spawned', { entity })
    this.emit('entity:spawned', entity)

    return entity
  }

  private fillWithDefaultValues (entity: Entity): Entity {
    switch (entity.type) {
      case EntityType.Zombie:
        if (!hasFacingProperty(entity)) {
          entity.facing = random.direction()
        }
        if (!hasAttitudeProperty(entity)) {
          entity.attitude = Attitude.Wandering
        }
        break
    }

    return entity
  }

  get<AnEntity extends Entity = Entity> (at: Coords, type?: OneOrMany<EntityType>): Array<AnEntity>
  get<AnEntity extends Entity = Entity> (type: EntityType, at?: OneOrMany<Coords>): Array<AnEntity>
  get<AnEntity extends Entity = Entity> (id: Array<EntityId>): Array<AnEntity>
  get<AnEntity extends Entity = Entity> (id: EntityId): Nullable<AnEntity>
  get<AnEntity extends Entity = Entity> (
    p1: Coords | EntityType | EntityId | Array<EntityId>,
    p2?: OneOrMany<EntityType> | OneOrMany<Coords>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any {
    if (isEntityId(p1)) {
      // get( EntityId )
      return this.entities.get(p1) ?? null
    }

    if (isCoords(p1)) {
      // get( Coords )
      // get( Coords, EntityType )
      // get( Coords, Array<EntityType> )
      this.outbreak.map.assertMapContains(p1)
      const here = WorldMap.index(p1)
      const entityIdsFromHere = this.entityIdsByCoords.get(here)
      if (!entityIdsFromHere?.size) {
        return []
      }
      const entities = this.get<AnEntity>(toArray(entityIdsFromHere))
      const types = toArray(p2)
      if (types.length > 0 && isEntityType(types[0])) {
        return entities.filter(({ type }) => types.includes(type))
      }
      return entities
    }

    if (isEntityType(p1)) {
      // get( EntityType )
      // get( EntityType, Coords )
      // get( EntityType, Array<Coords> )
      const creatureIdsByType = this.entityIdsByTypes.get(p1)
      if (!creatureIdsByType?.size) {
        return []
      }
      const creatures = this.get<AnEntity>(toArray(creatureIdsByType))
      const coords = toArray(p2)
      if (isCoordsArray(coords)) {
        return creatures.filter(({ at }) => coords.find(({ x, y }) => (at.x === x && at.y === y)))
      }
      return creatures
    }

    if (p1?.length > 0 && isEntityId(p1[0])) {
      // get( Array<EntityId> )
      return p1.flatMap(id => this.get<AnEntity>(id) ?? [])
    }

    this.log.error('WTF?! get(%j, %j)', p1, p2)
    return null
  }

  move<AnEntity extends Entity = Entity> (id: EntityId, to: Direction | Coords): AnEntity {
    const entity = this.get<AnEntity>(id)
    assert(entity, new NotFoundError(id, 'EntityId'))

    if (!this.canMove(entity, to)) {
      return entity
    }

    const from = entity.at
    let destination: Coords
    let facing: Direction
    if (isCoords(to)) {
      destination = to
      facing = calculateDirection(entity.at, to)
    } else {
      destination = calculateDestination(entity.at, DirectionInDegree[to], 1)
      facing = to
    }
    this.delete(entity)
    entity.at = destination

    if (hasFacingProperty(entity)) {
      entity.facing = facing
    }

    this.add(entity)
    this.emit('entity:moved', { entity, from })

    return entity
  }

  canMove (creature: Entity, to: Direction | Coords): boolean {
    let destination: Coords
    if (isCoords(to)) { // Todo check distance?
      destination = to
    } else {
      destination = calculateDestination(creature.at, DirectionInDegree[to], 1)
    }

    try {
      return this.outbreak.map.isWalkable(destination)
    } catch (error) {
      expect(error, OutOfMapError)
    }

    return false
  }

  private add (creature: Entity): Entity {
    const here = WorldMap.index(creature.at)

    this.entities.set(creature.id, creature)

    const creatureIdsFromHere = this.entityIdsByCoords.get(here)
    if (creatureIdsFromHere) {
      creatureIdsFromHere.add(creature.id)
      this.entityIdsByCoords.set(here, creatureIdsFromHere)
    } else {
      this.entityIdsByCoords.set(here, new Set([ creature.id ]))
    }

    const creatureIdsOfType = this.entityIdsByTypes.get(creature.type)
    if (creatureIdsOfType) {
      creatureIdsOfType.add(creature.id)
      this.entityIdsByTypes.set(creature.type, creatureIdsOfType)
    } else {
      this.entityIdsByTypes.set(creature.type, new Set([ creature.id ]))
    }
    return creature
  }

  private delete (entity: Entity): void {
    this.entities.delete(entity.id)

    const here = WorldMap.index(entity.at)
    const creatureIdsByCoords = this.entityIdsByCoords.get(here)
    if (creatureIdsByCoords) {
      creatureIdsByCoords.delete(entity.id)
      if (creatureIdsByCoords.size) {
        this.entityIdsByCoords.set(here, creatureIdsByCoords)
      } else {
        this.entityIdsByCoords.delete(here)
      }
    }

    const creatureIdsByType = this.entityIdsByTypes.get(entity.type)
    if (creatureIdsByType) {
      creatureIdsByType.delete(entity.id)
      if (creatureIdsByType.size) {
        this.entityIdsByTypes.set(entity.type, creatureIdsByType)
      } else {
        this.entityIdsByTypes.delete(entity.type)
      }
    }
  }
}

