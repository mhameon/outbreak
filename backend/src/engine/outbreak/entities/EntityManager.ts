import { EventEmitter } from '#common/TypedEventEmitter'
import type { Coords } from '#engine/types'
import { Direction } from '#engine/types'
import type { Logger } from '#common/logger'
import { Outbreak } from '#engine/outbreak/index'
import { random } from '#engine/math'
import { WorldMap } from '#engine/map/WorldMap'
import { isCoords } from '#engine/guards'
import { toArray } from '#common/helpers'
import { expect, NotFoundError } from '#common/Errors'
import { calculateDestination, closestDirection } from '#engine/math/geometry'
import { OutOfMapError } from '#engine/map/WorldMapErrors'
import assert from 'assert'
import {
  hasAttitudeProperty,
  hasFacingProperty,
  isEntityId,
  isEntityQuery,
  isEntityIdArray
} from '#engine/outbreak/entities/guards'
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
import { Nullable } from '#shared/types'
import { isEqual } from 'lodash'
import { toDegrees } from '#engine/helpers'

export type EntityManagerEvents = {
  'entity:spawned': Entity
  'entity:moved': { entity: Entity; from: Coords }
}

/**
 * Handle entities in an Outbreak and apply map constraints, lifecycle, etc.
 */
export class EntityManager extends EventEmitter<EntityManagerEvents> {
  readonly log: Logger
  readonly outbreak: Outbreak
  readonly #entities = new Map<EntityId, Entity>()
  readonly #entitiesByAttribute = new Map<QueryableEntityAttribute, Map<QueryableEntityAttributeSanitizedType, Set<EntityId>>>()

  // event
  static entity = {
    has: {
      spawned: 'entity:spawned',
      moved: 'entity:moved'
    }
  } as const

  constructor (outbreak: Outbreak) {
    super()
    this.log = outbreak.log.child({ label: this.constructor.name })
    this.outbreak = outbreak
    QUERYABLE_ENTITY_ATTRIBUTES.forEach((attribute) => {
      this.#entitiesByAttribute.set(attribute, new Map())
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

    this.register(entity)

    this.log.debug('Entity spawned', { entity })
    this.emit(EntityManager.entity.has.spawned, entity)

    return entity
  }

  private buildWithDefaultValues (entity: Entity): Entity {
    if (!hasFacingProperty(entity)) {
      entity.facing = random.direction()
    }

    switch (entity.type) {
      case EntityType.Zombie:
        if (!hasAttitudeProperty(entity)) {
          entity.attitude = Attitude.Wandering
        }
        break
    }

    return entity
  }

  /**
   * Find an Entity by his `EntityId`
   */
  find<AnEntity extends Entity = Entity> (id: EntityId): Nullable<AnEntity>
  /**
   * Find entities by an array of `EntityId`
   */
  find<AnEntity extends Entity = Entity> (id: Array<EntityId>): Array<AnEntity>
  /**
   * Find entities by querying an "indexed" attributes
   * @see QueryableEntityAttribute
   */
  find<AnEntity extends Entity = Entity> (query: EntityQuery): Array<AnEntity>
  /**
   * Find entities by querying an "indexed" attributes then applying an additional filter
   * @see QueryableEntityAttribute
   */
  find<AnEntity extends Entity = Entity> (query: EntityQuery, filter: EntityQueryFilters): Array<AnEntity>
  find<AnEntity extends Entity = Entity> (
    query: EntityId | Array<EntityId> | EntityQuery,
    filters?: EntityQueryFilters
  ): Array<AnEntity> | Nullable<AnEntity> | Entity {
    if (isEntityId(query)) {
      // find( EntityId )
      return this.#entities.get(query) ?? null
    }

    if (isEntityIdArray(query)) {
      // find( Array<EntityId> )
      return query.flatMap(id => this.find<AnEntity>(id) ?? [])
    }

    if (isEntityQuery(query)) {
      // find(query: EntityQuery, filter?: EntityQueryFilters)
      const parameters = Object.entries(query)
      const [[ attribute, value ]] = parameters.splice(0)
      const attributeMap = this.#entitiesByAttribute.get(attribute as QueryableEntityAttribute)
      const entityIds = attributeMap?.get(isCoords(value) ? WorldMap.index(value) : value)
      if (!entityIds?.size) {
        return []
      }

      // find(query: EntityQuery)
      const entities = this.find<AnEntity>(toArray(entityIds))
      if (!filters) {
        return entities
      }

      // find(query: EntityQuery, filter: EntityQueryFilters)
      const entries = Object.entries(filters)
      // Todo: perf: if `filters` has same keys than `query` keys, remove them from `entries` to avoid useless filtering
      return entities.filter(entity => {
        return entries.reduce((keep, [ property, value ]) => {
          if (property in entity) {
            return keep && toArray(value).some((v) => isEqual(v, entity[property as keyof Entity]))
          }
          return false
        }, true)
      })
    }

    this.log.error('WTF?! find(%j)', { query, filters })
    return []
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
      facing = closestDirection(entity.at, to)
    } else {
      destination = calculateDestination(entity.at, toDegrees(to), 1)
      facing = to
    }
    this.unregister(entity)
    entity.at = destination

    if (hasFacingProperty(entity)) {
      entity.facing = facing
    }

    this.register(entity)
    this.emit(EntityManager.entity.has.moved, { entity, from })

    return entity
  }

  canMove (creature: Entity, to: Direction | Coords): boolean {
    let destination: Coords
    if (isCoords(to)) { // Todo check distance?
      destination = to
    } else {
      destination = calculateDestination(creature.at, toDegrees(to), 1)
    }

    try {
      return this.outbreak.map.isWalkable(destination)
    } catch (error) {
      expect(error, OutOfMapError)
    }

    return false
  }

  private register (entity: Entity): Entity {
    this.#entities.set(entity.id, entity)
    QUERYABLE_ENTITY_ATTRIBUTES.forEach((attribute) => {
      if (attribute in entity) {
        const attributeMap = this.#entitiesByAttribute.get(attribute)
        assert(attributeMap, `entitiesByAttribute must exists for "${attribute}"`)
        const attributeValue = this.getSanitizedAttribute(entity[attribute])
        const entities = attributeMap?.get(attributeValue)
        this.#entitiesByAttribute.set(
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

  private unregister (entity: Entity): void {
    this.#entities.delete(entity.id)
    QUERYABLE_ENTITY_ATTRIBUTES.forEach((attribute) => {
      if (attribute in entity) {
        const attributeMap = this.#entitiesByAttribute.get(attribute)
        assert(attributeMap, `entitiesByAttribute must exists for "${attribute}"`)
        const attributeValue = this.getSanitizedAttribute(entity[attribute])
        const entities = attributeMap?.get(attributeValue)
        if (entities) {
          entities.delete(entity.id)
          if (entities.size) {
            this.#entitiesByAttribute.set(
              attribute,
              attributeMap.set(attributeValue, entities)
            )
          } else {
            attributeMap.delete(attributeValue)
            this.#entitiesByAttribute.set(attribute, attributeMap)
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

