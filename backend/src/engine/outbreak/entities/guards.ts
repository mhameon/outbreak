import { isObject } from '#shared/guards'
import { isEntityType, isCoords } from '#engine/guards'
import {
  Zombie,
  WithVolume,
  WithAttitude,
  WithFacing,
  Entity,
  EntityType,
  EntityId
} from '#engine/outbreak/entities/types'

export const isEntityId = (id: unknown): id is EntityId => typeof id === 'string'

export const isEntity = (entity: unknown): entity is Entity => {
  return isObject(entity) && typeof entity.id === 'string' && isEntityType(entity.type) && isCoords(entity.at)
}

export const hasFacingProperty = (entity: unknown): entity is WithFacing => {
  return isObject(entity) && 'facing' in entity
}

export const hasAttitudeProperty = (entity: unknown): entity is WithAttitude => {
  return isObject(entity) && 'attitude' in entity
}

export const isZombie = (entity: unknown): entity is Zombie => {
  return isEntity(entity) && hasFacingProperty(entity) && hasAttitudeProperty(entity) && entity.type === EntityType.Zombie
}

export const hasVolumeProperty = (entity: unknown): entity is WithVolume => {
  return isObject(entity) && 'volume' in entity
}
