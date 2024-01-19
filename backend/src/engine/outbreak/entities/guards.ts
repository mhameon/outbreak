import { isEntityType, isCoords } from '#engine/guards'
import {
  Zombie,
  WithVolume,
  WithAttitude,
  WithFacing,
  Entity,
  EntityType,
  EntityId,
  QueryableEntityAttribute,
  QUERYABLE_ENTITY_ATTRIBUTES,
  EntityQuery
} from '#engine/outbreak/entities/types'
import { isObject } from '#shared/guards'

export const isEntityId = (id: unknown): id is EntityId => typeof id === 'string'

export const isEntityIdArray = (array: unknown): array is Array<EntityId> => Array.isArray(array) && array.length > 0 && isEntityId(array[0])

export const isEntity = (entity: unknown): entity is Entity => {
  return isObject(entity) && typeof entity.id === 'string' && isEntityType(entity.type) && isCoords(entity.at)
}

export const isZombie = (entity: unknown): entity is Zombie => {
  return isEntity(entity) && hasFacingProperty(entity) && hasAttitudeProperty(entity) && entity.type === EntityType.Zombie
}

export const hasFacingProperty = (entity: unknown): entity is WithFacing => {
  return isObject(entity) && 'facing' in entity
}

export const hasAttitudeProperty = (entity: unknown): entity is WithAttitude => {
  return isObject(entity) && 'attitude' in entity
}

export const hasVolumeProperty = (entity: unknown): entity is WithVolume => {
  return isObject(entity) && 'volume' in entity
}

export const isEntityQuery = (query: unknown): query is EntityQuery => {
  if (isObject(query)) {
    return Object.entries(query).reduce((isEntityQuery, [ attribute, ]) => {
      return isEntityQuery && isQueryableEntityAttribute(attribute)
    }, true)
  }
  return false
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isQueryableEntityAttribute = (attribute: any): attribute is QueryableEntityAttribute => {
  return QUERYABLE_ENTITY_ATTRIBUTES.includes(attribute)
}
