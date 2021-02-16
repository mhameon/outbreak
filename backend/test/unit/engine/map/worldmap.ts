import WorldMap from '@engine/map/WorldMap'
import { Tile, Direction, Tileset } from '@engine/types'

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

  it('add(tile, at)', function () {
    assert.ok(map.has(Tile.Block, origin))

    map.add(Tile.Block, origin)
    map.add(Tile.Block, origin)
    map.add(Tile.Water, origin)
    map.add(Tile.Water, origin)
    assert.strictEqual(map.get(origin).size, 2)

    map.add(Tile.Road, [ origin, { x: 1, y: 0 }, { x: 2, y: 0 }])
    assert.ok(map.has([ Tile.Road, Tile.Water, Tile.Block ], origin))
    assert.ok(map.has(Tile.Road, { x: 1, y: 0 }))
    assert.ok(map.has(Tile.Road, { x: 2, y: 0 }))
  })

  it('set(tile, at)', function () {
    map.set(Tile.Road, origin)
    assert.ok(map.has([ Tile.Road ], origin))
    assert.strictEqual(map.has(Tile.Block, origin), false)

    map.set(Tile.Road, [ origin, { x: 1, y: 0 }, { x: 2, y: 0 }])
    assert.ok(map.has([ Tile.Road ], origin))
    assert.ok(map.has([ Tile.Road ], { x: 1, y: 0 }))
    assert.ok(map.has([ Tile.Road ], { x: 2, y: 0 }))

    map.set([ Tile.Water, Tile.Block ], origin)
    assert.ok(map.has([ Tile.Water, Tile.Block ], origin))

    map.set([ Tile.Walkable ], origin)
    assert.ok(map.has(Tile.Walkable, origin)) // default value for empty square

    map.set([ Tile.Walkable, Tile.Block ], origin) // great idea stupid!
    assert.ok(map.has(Tile.Walkable, origin)) // default value for empty square
  })

  it('get(at)', function () {
    const tile = map.get(origin)
    assert.ok(tile.has(Tile.Block))
    assert.strictEqual(tile.has(Tile.Walkable), false)
  })

  it('getAround(at)', function () {
    const around = map.getAround({ x: 1, y: 0 })

    assert.strictEqual(around.get(Direction.NorthWest), undefined)
    assert.strictEqual(around.get(Direction.North), undefined)
    assert.strictEqual(around.get(Direction.NorthEast), undefined)

    assert.ok((around.get(Direction.West) as Tileset).has(Tile.Block))
    assert.ok((around.get(Direction.East) as Tileset).has(Tile.Walkable))

    assert.ok((around.get(Direction.SouthWest) as Tileset).has(Tile.Walkable))
    assert.ok((around.get(Direction.South) as Tileset).has(Tile.Walkable))
    assert.ok((around.get(Direction.SouthEast) as Tileset).has(Tile.Walkable))
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
    assert.strictEqual(map.contains({ x: 10, y: 10 }), false)

    const outside = { x: 10, y: 10 }
    const error = /Coords 10,10 is outside map \(5x5\)/
    assert.throws(() => map.isWalkable(outside), error)
    assert.throws(() => map.has(Tile.Block, outside), error)
    assert.throws(() => map.get(outside), error)
  })

  it('Add `Tile.Walkable` removes `Tile.Block`', function () {
    assert.strictEqual(map.isWalkable(origin), false)

    map.add(Tile.Walkable, origin)
    map.add(Tile.Road, origin)
    assert.ok(map.has(Tile.Road, origin))
    assert.ok(map.isWalkable(origin))
  })

  it('each', function () {
    let iteration = 0
    map.add(Tile.Block, { x: 4, y: 4 })
    map.each(square => {
      iteration++
      if ((square.coords.x === 0 && square.coords.y === 0) || (square.coords.x === 4 && square.coords.y === 4)) {
        assert.ok(square.tileset.has(Tile.Block))
      }
    })
    assert.strictEqual(iteration, 2)
  })
})
