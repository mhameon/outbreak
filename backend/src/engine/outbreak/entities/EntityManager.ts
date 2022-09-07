import { EventEmitter } from '#common/TypedEventEmitter'
import type { Coords } from '#engine/types'
import { Direction, DirectionInDegree } from '#engine/types'
import type { Logger } from '#common/logger'
import { Outbreak } from '#engine/outbreak/index'
import { random } from '#engine/math'
import { WorldMap } from '#engine/map/WorldMap'
import { isCoords } from '#engine/guards'
import { Nullable } from '#common/types'
import { toArray } from '#common/helpers'
import { expect, NotFoundError } from '#common/Errors'
import { calculateDestination, calculateDirection } from '#engine/math/geometry'
import { OutOfMapError } from '#engine/map/WorldMapErrors'
import assert from 'assert'
import { hasAttitudeProperty, hasFacingProperty, isEntityId, isEntityQuery } from '#engine/outbreak/entities/guards'
import {
  Entity,
  EntityProperties,
  Attitude,
  EntityType,
  EntityId,
  EntityQuery,
  QueryableEntityAttributeSanitizedType,
  QueryableEntityAttribute,
  QUERYABLE_ENTITY_ATTRIBUTES, EntityQueryFilters, QueryableEntityAttributeType
} from '#engine/outbreak/entities/types'
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
  private readonly entitiesByAttribute = new Map<QueryableEntityAttribute, Map<QueryableEntityAttributeSanitizedType, Set<EntityId>>>()

  constructor (outbreak: Outbreak) {
    super()
    this.log = outbreak.log.child({ label: this.constructor.name })
    this.outbreak = outbreak
    QUERYABLE_ENTITY_ATTRIBUTES.forEach((attribute) => {
      this.entitiesByAttribute.set(attribute, new Map())
    })
  }

  spawn (type: EntityType, at: Coords, attributes?: EntityProperties): Readonly<Entity> {
    this.outbreak.map.assertMapContains(at)

    const entity: Entity = this.buildWithDefaultValues({
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

  private buildWithDefaultValues (entity: Entity): Entity {
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

  find<AnEntity extends Entity = Entity> (id: Array<EntityId>): Array<AnEntity>
  find<AnEntity extends Entity = Entity> (id: EntityId): Nullable<AnEntity>
  find<AnEntity extends Entity = Entity> (query: EntityQuery, filter?: EntityQueryFilters): Array<AnEntity>
  find<AnEntity extends Entity = Entity> (
    p1: EntityId | Array<EntityId> | EntityQuery,
    filters?: EntityQueryFilters
  ): Array<AnEntity> | Nullable<AnEntity> | Entity {
    if (isEntityId(p1)) {
      // find( EntityId )
      return this.entities.get(p1) ?? null
    }

    if (isEntityQuery(p1)) {
      // find(query: EntityQuery, filter?: EntityQueryFilters)
      const parameters = Object.entries(p1)
      const [[ attribute, value ]] = parameters.splice(0)
      const attributeMap = this.entitiesByAttribute.get(attribute as QueryableEntityAttribute)
      const entityIds = attributeMap?.get(isCoords(value) ? WorldMap.index(value) : value)
      if (!entityIds?.size) {
        return []
      }
      const entities = this.find<AnEntity>(toArray(entityIds))

      if (!filters) {
        return entities
      }

      return entities.filter(entity => {
        return Object.entries(filters).reduce((keep, [ attribute, value ]) => {
          if (!(attribute in entity)) {
            return false
          }
          const entityAttribute = entity[attribute as QueryableEntityAttribute]
          return keep && (Array.isArray(value) ? value : [ value ]).includes(entityAttribute)
        }, true)
      })
    }

    if (p1?.length > 0 && isEntityId(p1[0])) {
      // find( Array<EntityId> )
      return p1.flatMap(id => this.find<AnEntity>(id) ?? [])
    }

    this.log.error('WTF?! find(%j)', p1)
    return null
  }

  move<AnEntity extends Entity = Entity> (id: EntityId, to: Direction | Coords): AnEntity {
    const entity = this.find<AnEntity>(id)
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

  private add (entity: Entity): Entity {
    this.entities.set(entity.id, entity)
    QUERYABLE_ENTITY_ATTRIBUTES.forEach((attribute) => {
      if (attribute in entity) {
        const attributeMap = this.entitiesByAttribute.get(attribute)
        assert(attributeMap, `entitiesByAttribute must exists for "${attribute}"`)
        const attributeValue = this.getSanitizedAttribute(entity[attribute])
        const entities = attributeMap?.get(attributeValue)
        this.entitiesByAttribute.set(
          attribute,
          attributeMap.set(
            attributeValue,
            entities ? entities.add(entity.id) : new Set([ entity.id ])
          )
        )
      }
    })

    return entity
  }

  private delete (entity: Entity): void {
    this.entities.delete(entity.id)
    QUERYABLE_ENTITY_ATTRIBUTES.forEach((attribute) => {
      if (attribute in entity) {
        const attributeMap = this.entitiesByAttribute.get(attribute)
        assert(attributeMap, `entitiesByAttribute must exists for "${attribute}"`)
        const attributeValue = this.getSanitizedAttribute(entity[attribute])
        const entities = attributeMap?.get(attributeValue)
        if (entities) {
          entities.delete(entity.id)
          if (entities.size) {
            this.entitiesByAttribute.set(
              attribute,
              attributeMap.set(attributeValue, entities)
            )
          } else {
            attributeMap.delete(attributeValue)
            this.entitiesByAttribute.set(attribute, attributeMap)
          }
        }
      }
    })
  }

  /**
   * Returns the sanitized entity's attribute value
   */
  private getSanitizedAttribute (value: QueryableEntityAttributeType): QueryableEntityAttributeSanitizedType {
    if (isCoords(value)) {
      return WorldMap.index(value)
    }
    return value
  }
}

