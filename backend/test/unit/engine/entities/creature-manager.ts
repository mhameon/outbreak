import { Outbreak } from '@engine/outbreak'
import { WorldMap } from '@engine/map/WorldMap'
import type { Creature } from '@engine/outbreak/entities/CreatureManager'
import { CreatureType } from '@engine/outbreak/entities/CreatureManager'
import * as assert from 'assert'
import type { CreatureEvent } from '@engine/events'
import event from '@engine/events'

function assertCreatureEqual (actual: Creature | null, expected: Creature): void {
  assert.ok(actual)
  assert.strictEqual(actual.id, expected.id)
  assert.strictEqual(actual.type, expected.type)
  assert.deepStrictEqual(actual.at, expected.at)
}

const events: Record<CreatureEvent, Creature[]> = {
  [event.creature.spawned]: []
}

describe('CreatureManager class', function () {
  const origin = { x: 0, y: 0 }
  const pos1 = { x: 1, y: 0 }
  let map: WorldMap, outbreak: Outbreak
  let zombie: Creature
  let zombie2: Creature
  let survivor: Creature

  before(function () {
    map = new WorldMap({ width: 5, height: 5 })
    outbreak = new Outbreak('CreatureManagerTest', map)

    outbreak.creature.on(event.creature.spawned, (creature: Creature) => {
      events[event.creature.spawned].push(creature)
    })

    zombie = outbreak.creature.spawn(CreatureType.Zombie, origin)
    zombie2 = outbreak.creature.spawn(CreatureType.Zombie, pos1)
    survivor = outbreak.creature.spawn(CreatureType.Survivor, pos1)

    assert.strictEqual(events['creature:spawned'].length, 3)
    assert.deepStrictEqual(events['creature:spawned'], [ zombie, zombie2, survivor ])
  })

  afterEach(function () {
    events['creature:spawned'] = []
  })

  it('spawn', function () {
    assert.ok(zombie.id)
    assert.strictEqual(zombie.type, CreatureType.Zombie)
    assert.deepStrictEqual(zombie.at, origin)
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
})
