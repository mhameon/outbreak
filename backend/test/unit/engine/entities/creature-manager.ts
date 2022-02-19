import { Outbreak } from '#engine/outbreak/index'
import { WorldMap } from '#engine/map/WorldMap'
import type { Creature } from '#engine/outbreak/entities/CreatureManager'
import { CreatureType } from '#engine/outbreak/entities/CreatureManager'
import * as assert from 'assert'
import event from '#engine/events'
import { OutOfMapError } from '#engine/map/WorldMapErrors'
import { NotFoundError } from '#shared/Errors'
import { Direction, Coords, Tile } from '#engine/types'

function assertCreatureEqual (actual: Creature | null, expected: Creature): void {
  assert.ok(actual)
  assert.strictEqual(actual.id, expected.id)
  assert.strictEqual(actual.type, expected.type)
  assert.deepStrictEqual(actual.at, expected.at)
}

const events = {
  [event.creature.spawned]: new Array<Creature>(),
  [event.creature.moved]: new Array<{ creature: Creature; from: Coords }>()
}

describe('CreatureManager class', function () {
  const origin: Coords = { x: 0, y: 0 }
  const pos1: Coords = { x: 1, y: 0 }
  let map: WorldMap, outbreak: Outbreak
  let zombie: Creature
  let zombie2: Creature
  let survivor: Creature

  before(function () {
    map = new WorldMap({ width: 5, height: 5 })
    map.set(Tile.Block, { x: 0, y: 1 })
    outbreak = new Outbreak('CreatureManagerTest', map)

    outbreak.creature.on(event.creature.spawned, (creature: Creature) => {
      events[event.creature.spawned].push(creature)
    })
    outbreak.creature.on(event.creature.moved, (payload: { creature: Creature; from: Coords }) => {
      events[event.creature.moved].push(payload)
    })

    zombie = outbreak.creature.spawn(CreatureType.Zombie, origin)
    zombie2 = outbreak.creature.spawn(CreatureType.Zombie, pos1)
    survivor = outbreak.creature.spawn(CreatureType.Survivor, pos1)

    assert.strictEqual(events['creature:spawned'].length, 3)
    assert.deepStrictEqual(events['creature:spawned'], [ zombie, zombie2, survivor ])
  })

  afterEach(function () {
    events[event.creature.spawned] = []
    events[event.creature.moved] = []
  })

  describe('spawn', function () {
    it('should spawn a zombie', function () {
      assert.ok(zombie.id)
      assert.strictEqual(zombie.type, CreatureType.Zombie)
      assert.deepStrictEqual(zombie.at, origin)
    })
    it('should throw if outside map', function () {
      try {
        outbreak.creature.spawn(CreatureType.Zombie, { x: 999, y: 999 })
        assert.fail('OutOfMapError should have been thrown')
      } catch (e) {
        assert.ok(e instanceof OutOfMapError)
      }
    })
  })

  describe('get', function () {
    it('get(CreatureId)', function () {
      assertCreatureEqual(outbreak.creature.get(zombie.id), zombie)
      assert.strictEqual(outbreak.creature.get('unknown'), null)
    })
    it('get(Array<CreatureId>)', function () {
      const z = outbreak.creature.get([ zombie.id, survivor.id ])
      assert.strictEqual(z.length, 2)
      assertCreatureEqual(z[0], zombie)
      assertCreatureEqual(z[1], survivor)

      assert.deepStrictEqual(outbreak.creature.get([ 'unknown' ]), [])
    })
    it('get(Coords)', function () {
      const z = outbreak.creature.get(pos1)
      assertCreatureEqual(z[0], zombie2)
      assertCreatureEqual(z[1], survivor)

      assert.deepStrictEqual(outbreak.creature.get({ x: 0, y: 3 }), [])
    })
    it('get(Coords, CreatureType)', function () {
      const z = outbreak.creature.get(pos1, CreatureType.Survivor)
      assert.strictEqual(z.length, 1)
      assertCreatureEqual(z[0], survivor)
    })
    it('get(Coords, Array<CreatureType>)', function () {
      let z = outbreak.creature.get(pos1, [ CreatureType.Survivor ])
      assert.strictEqual(z.length, 1)
      assertCreatureEqual(z[0], survivor)

      z = outbreak.creature.get(pos1, [ CreatureType.Survivor, CreatureType.Zombie ])
      assert.strictEqual(z.length, 2)
      assertCreatureEqual(z[0], zombie2)
      assertCreatureEqual(z[1], survivor)
    })
    it('get(CreatureType)', function () {
      const z = outbreak.creature.get(CreatureType.Zombie)
      assert.strictEqual(z.length, 2)
      assertCreatureEqual(z[0], zombie)
      assertCreatureEqual(z[1], zombie2)
    })
    it('get(CreatureType, Coords)', function () {
      const z = outbreak.creature.get(CreatureType.Zombie, pos1)
      assert.strictEqual(z.length, 1)
      assertCreatureEqual(z[0], zombie2)
    })
    it('get(CreatureType, Array<Coords>)', function () {
      let z = outbreak.creature.get(CreatureType.Zombie, [ pos1 ])
      assert.strictEqual(z.length, 1)
      assertCreatureEqual(z[0], zombie2)

      z = outbreak.creature.get(CreatureType.Zombie, [ pos1, origin ])
      assert.strictEqual(z.length, 2)
      assertCreatureEqual(z[0], zombie)
      assertCreatureEqual(z[1], zombie2)
    })
  })

  describe('move', function () {
    it('should thrown if creature id doesn\'t exist', function () {
      try {
        outbreak.creature.move('unknown_id', Direction.East)
        assert.fail('NotFoundError should have been thrown')
      } catch (e) {
        assert.ok(e instanceof NotFoundError)
        assert.strictEqual(e.message, '"unknown_id" is an unknown CreatureId')
      }
    })

    it('should not move when destination is out of the map', function () {
      outbreak.creature.move(zombie.id, Direction.North)
      assert.deepStrictEqual((outbreak.creature.get(zombie.id) as Creature).at, origin)
      assert.strictEqual(events[event.creature.moved].length, 0)
    })

    it('should not move when destination is a Tile.Block', function () {
      outbreak.creature.move(zombie.id, Direction.South)
      assert.deepStrictEqual((outbreak.creature.get(zombie.id) as Creature).at, origin)
      assert.strictEqual(events[event.creature.moved].length, 0)
    })

    it('should move the survivor', function () {
      assertCreatureEqual(outbreak.creature.get(survivor.id), survivor)
      outbreak.creature.move(survivor.id, Direction.East)

      let { creature, from } = events[event.creature.moved][0]
      assertCreatureEqual(creature, survivor)
      assert.deepStrictEqual(from, pos1)

      assert.deepStrictEqual(outbreak.creature.get(pos1), [ zombie2 ])
      assert.deepStrictEqual(survivor.at, { x: 2, y: 0 })
      assert.deepStrictEqual(outbreak.creature.get({ x: 2, y: 0 }), [ survivor ])
      assert.deepStrictEqual(outbreak.creature.get(survivor.id), survivor)

      //move back
      outbreak.creature.move(survivor.id, Direction.West)
      ;({ creature, from } = events[event.creature.moved][1])
      assertCreatureEqual(creature, survivor)
      assert.deepStrictEqual(from, { x: 2, y: 0 })
      assert.deepStrictEqual(creature.at, pos1)
    })
  })
})
