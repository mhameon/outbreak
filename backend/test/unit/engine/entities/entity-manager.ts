import { Outbreak } from '#engine/outbreak/index'
import { WorldMap } from '#engine/map/WorldMap'
import * as assert from 'assert'
import { OutOfMapError } from '#engine/map/WorldMapErrors'
import { NotFoundError } from '#shared/Errors'
import { Direction, Coords, Tile } from '#engine/types'
import { Entity, EntityType } from '#engine/outbreak/entities/types'
import { EntityManagerEvents } from '#engine/events'

function assertCreatureEqual (actual: Entity | null, expected: Entity): void {
  assert.ok(actual)
  assert.strictEqual(actual.id, expected.id)
  assert.strictEqual(actual.type, expected.type)
  assert.deepStrictEqual(actual.at, expected.at)
}

const events = {
  ['entity:spawned']: new Array<EntityManagerEvents['entity:spawned']>(),
  ['entity:moved']: new Array<EntityManagerEvents['entity:moved']>()
}

describe('EntityManager class', function () {
  const origin: Coords = { x: 0, y: 0 }
  const pos1: Coords = { x: 1, y: 0 }
  let map: WorldMap, outbreak: Outbreak
  let zombie: Entity
  let zombie2: Entity
  let survivor: Entity

  before(function () {
    map = new WorldMap({ width: 5, height: 5 })
    map.set(Tile.Block, { x: 0, y: 1 })
    outbreak = new Outbreak('game_CreatureManagerTest', map)

    outbreak.entity.on('entity:spawned', (creature) => {
      events['entity:spawned'].push(creature)
    })
    outbreak.entity.on('entity:moved', (payload) => {
      events['entity:moved'].push(payload)
    })

    zombie = outbreak.entity.spawn(EntityType.Zombie, origin)
    zombie2 = outbreak.entity.spawn(EntityType.Zombie, pos1)
    survivor = outbreak.entity.spawn(EntityType.Human, pos1)

    assert.strictEqual(events['entity:spawned'].length, 3)
    assert.deepStrictEqual(events['entity:spawned'], [ zombie, zombie2, survivor ])
  })

  afterEach(function () {
    events['entity:spawned'] = []
    events['entity:moved'] = []
  })

  describe('spawn', function () {
    it('should spawn a zombie', function () {
      assert.ok(zombie.id)
      assert.strictEqual(zombie.type, EntityType.Zombie)
      assert.deepStrictEqual(zombie.at, origin)
    })
    it('should throw if outside map', function () {
      try {
        outbreak.entity.spawn(EntityType.Zombie, { x: 999, y: 999 })
        assert.fail('OutOfMapError should have been thrown')
      } catch (e) {
        assert.ok(e instanceof OutOfMapError)
      }
    })
  })

  describe('get', function () {
    it('get(EntityId)', function () {
      assertCreatureEqual(outbreak.entity.get(zombie.id), zombie)
      assert.strictEqual(outbreak.entity.get('unknown'), null)
    })
    it('get(Array<EntityId>)', function () {
      const z = outbreak.entity.get([ zombie.id, survivor.id ])
      assert.strictEqual(z.length, 2)
      assertCreatureEqual(z[0], zombie)
      assertCreatureEqual(z[1], survivor)

      assert.deepStrictEqual(outbreak.entity.get([ 'unknown' ]), [])
    })
    it('get(Coords)', function () {
      const z = outbreak.entity.get(pos1)
      assertCreatureEqual(z[0], zombie2)
      assertCreatureEqual(z[1], survivor)

      assert.deepStrictEqual(outbreak.entity.get({ x: 0, y: 3 }), [])
    })
    it('get(Coords, EntityType)', function () {
      const z = outbreak.entity.get(pos1, EntityType.Human)
      assert.strictEqual(z.length, 1)
      assertCreatureEqual(z[0], survivor)
    })
    it('get(Coords, Array<EntityType>)', function () {
      let z = outbreak.entity.get(pos1, [ EntityType.Human ])
      assert.strictEqual(z.length, 1)
      assertCreatureEqual(z[0], survivor)

      z = outbreak.entity.get(pos1, [ EntityType.Human, EntityType.Zombie ])
      assert.strictEqual(z.length, 2)
      assertCreatureEqual(z[0], zombie2)
      assertCreatureEqual(z[1], survivor)
    })
    it('get(EntityType)', function () {
      const z = outbreak.entity.get(EntityType.Zombie)
      assert.strictEqual(z.length, 2)
      assertCreatureEqual(z[0], zombie)
      assertCreatureEqual(z[1], zombie2)
    })
    it('get(EntityType, Coords)', function () {
      const z = outbreak.entity.get(EntityType.Zombie, pos1)
      assert.strictEqual(z.length, 1)
      assertCreatureEqual(z[0], zombie2)
    })
    it('get(EntityType, Array<Coords>)', function () {
      let z = outbreak.entity.get(EntityType.Zombie, [ pos1 ])
      assert.strictEqual(z.length, 1)
      assertCreatureEqual(z[0], zombie2)

      z = outbreak.entity.get(EntityType.Zombie, [ pos1, origin ])
      assert.strictEqual(z.length, 2)
      assertCreatureEqual(z[0], zombie)
      assertCreatureEqual(z[1], zombie2)
    })
  })

  describe('move', function () {
    it('should thrown if entity id doesn\'t exist', function () {
      try {
        outbreak.entity.move('unknown_id', Direction.East)
        assert.fail('NotFoundError should have been thrown')
      } catch (e) {
        assert.ok(e instanceof NotFoundError)
        assert.strictEqual(e.message, '"unknown_id" is an unknown EntityId')
      }
    })

    it('should not move when destination is out of the map', function () {
      outbreak.entity.move(zombie.id, Direction.North)
      assert.deepStrictEqual((outbreak.entity.get(zombie.id) as Entity).at, origin)
      assert.strictEqual(events['entity:moved'].length, 0)
    })

    it('should not move when destination is a Tile.Block', function () {
      outbreak.entity.move(zombie.id, Direction.South)
      assert.deepStrictEqual((outbreak.entity.get(zombie.id) as Entity).at, origin)
      assert.strictEqual(events['entity:moved'].length, 0)
    })

    it('should move the survivor', function () {
      assertCreatureEqual(outbreak.entity.get(survivor.id), survivor)
      outbreak.entity.move(survivor.id, Direction.East)

      let { entity, from } = events['entity:moved'][0]
      assertCreatureEqual(entity, survivor)
      assert.deepStrictEqual(from, pos1)

      assert.deepStrictEqual(outbreak.entity.get(pos1), [ zombie2 ])
      assert.deepStrictEqual(survivor.at, { x: 2, y: 0 })
      assert.deepStrictEqual(outbreak.entity.get({ x: 2, y: 0 }), [ survivor ])
      assert.deepStrictEqual(outbreak.entity.get(survivor.id), survivor)

      //move back
      outbreak.entity.move(survivor.id, Direction.West)
      ;({ entity, from } = events['entity:moved'][1])
      assertCreatureEqual(entity, survivor)
      assert.deepStrictEqual(from, { x: 2, y: 0 })
      assert.deepStrictEqual(entity.at, pos1)
    })
  })
})
