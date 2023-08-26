import assert from 'assert'
import {
  isEntity,
  isEntityIdArray,
  hasVolumeProperty,
  isZombie,
  isEntityId,
  hasAttitudeProperty
} from '#engine/outbreak/entities/guards'
import { EntityType, Attitude } from '#engine/outbreak/entities/types'
import { Direction } from '#engine/types'

describe('Entity type guards', function () {
  it('isEntityId', function () {
    assert.ok(isEntityId('EntityId'))
  })
  it('isEntityIdArray', function () {
    assert.ok(isEntityIdArray([ 'EntityId' ]))
  })

  describe('Entity', function () {
    it('isEntity', function () {
      assert.ok(isEntity({ id: 'EntityId', type: EntityType.Zombie, at: { x: 0, y: 0 } }))
      assert.strictEqual(isEntity({ id: 'EntityId', type: EntityType.Zombie }), false)
    })
    it('isZombie', function () {
      assert.ok(isZombie({
        id: 'EntityId',
        type: EntityType.Zombie,
        at: { x: 0, y: 0 },
        facing: Direction.South,
        attitude: Attitude.Wandering
      }))
    })
  })

  describe('Entity properties', function () {
    it('hasFacingProperty', function () {
      assert.ok({ facing: Direction.North })
    })
    it('hasAttitudeProperty', function () {
      assert.ok(hasAttitudeProperty({ attitude: Attitude.Tracking }))
    })
    it('hasVolumeProperty', function () {
      assert.ok(hasVolumeProperty({ volume: 42 }))
    })
  })
})
