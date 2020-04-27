import WorldMap from '../../../src/map/WorldMap'
import { Tile } from '../../../src/@types/outbreak'

import * as assert from 'assert'

describe('WorldMap class', function () {
  let map: WorldMap
  const origin = { x: 0, y: 0 }

  beforeEach(function () {
    map = new WorldMap(5, 5)
    map.add(Tile.Block, origin)
  })

  it('size', function () {
    assert.strictEqual(map.size.width, 5)
    assert.strictEqual(map.size.height, 5)
  })

  it('get(at)', function () {
    const tile = map.get(origin)
    assert.ok(tile.has(Tile.Block))
    assert.strictEqual(tile.has(Tile.Walkable), false)
  })

  it('has(tile, at)', function () {
    assert.ok(map.has(Tile.Block, origin))
    assert.strictEqual(map.has([ Tile.Water, Tile.Block ], origin), false)
  })

  it('has(tile[], at)', function () {
    map.add(Tile.Water, origin)
    assert.ok(map.has(Tile.Block, origin))
    assert.ok(map.has([ Tile.Water, Tile.Block ], origin))
    assert.ok(map.has([ Tile.Block, Tile.Water ], origin))
    assert.strictEqual(map.has([ Tile.Block, Tile.Road ], origin), false)
  })

  it('isWalkable(at)', function () {
    assert.strictEqual(map.isWalkable(origin), false)
    assert.ok(map.isWalkable({ x: 1, y: 0 }))
  })

  it('No tile duplication', function () {
    map.add(Tile.Block, origin)
    const tiles = map.get(origin)
    assert.strictEqual(tiles.size, 1)
  })

  it('fails when working outside the map', function () {
    assert.strictEqual(map.isInside({ x: 10, y: 10 }), false)

    const outside = { x: 10, y: 10 }
    const error = /Coords 10,10 are outside map \(5x5\)/
    assert.throws(() => map.isWalkable(outside), error)
    assert.throws(() => map.add(Tile.Block, outside), error)
    assert.throws(() => map.has(Tile.Block, outside), error)
    assert.throws(() => map.get(outside), error)
  })

  it('Add Tile.Walkable removes Tile.Block', function () {
    assert.strictEqual(map.isWalkable(origin), false)

    map.add(Tile.Walkable, origin)
    map.add(Tile.Road, origin)
    assert.ok(map.has(Tile.Road, origin))
    assert.ok(map.isWalkable(origin))
  })
})
