import WorldMap from '@engine/map/WorldMap'
import { Tile, Direction, Tileset, Coords } from '@engine/types'

import * as assert from 'assert'
import { InvalidArgumentError } from '@shared/Errors'
import { stringifyTileset } from '@engine/map/WorldMapErrors'

describe('WorldMap class', function () {
  let map: WorldMap
  const origin = { x: 0, y: 0 }

  beforeEach(function () {
    map = new WorldMap({ width: 5, height: 5 })
    map.set([ Tile.Block ], origin)
  })

  describe('size', function () {
    it('should return correct map size', function () {
      assert.strictEqual(map.size.width, 5)
      assert.strictEqual(map.size.height, 5)
    })
  })

  describe('add(tile, at)', function () {
    it('should find (has) the right tile', function () {
      assert.ok(map.has(Tile.Block, origin))
    })
    it('should not add tiles twice', function () {
      assert.strictEqual(map.add(Tile.Block, origin), 0)
      assert.strictEqual(map.add(Tile.Block, origin), 0)
      assert.strictEqual(map.add(Tile.Water, origin), 1)
      assert.strictEqual(map.add(Tile.Water, origin), 0)
      assert.strictEqual(map.get(origin).size, 2)
    })
    it('should not possible to burn water', function() {
      const at = { x: 1, y: 1 }
      map.set(Tile.Water, at)
      assert.ok(map.has(Tile.Water, at))
      assert.strictEqual(map.get(at).size, 1)

      assert.strictEqual(map.add(Tile.Burning, at), 0)
      assert.ok(map.has(Tile.Water, at))
      assert.strictEqual(map.get(at).size, 1)
    })
  })
  describe('add(tile, at[])', function () {
    it('should add a tile at multiple coords', function () {
      assert.strictEqual(map.add(Tile.Road, [ origin, { x: 1, y: 0 }, { x: 2, y: 0 }]), 3)
      assert.ok(map.has([ Tile.Road, Tile.Block ], origin))
      assert.ok(map.has(Tile.Road, { x: 1, y: 0 }))
      assert.ok(map.has(Tile.Road, { x: 2, y: 0 }))
    })
  })
  describe('add(tile[], at)', function () {
    it('should add multiple tile at coords')
  })
  describe('add(tile[], at[])', function () {
    it('should add multiple tile at multiple coords')
  })

  describe('set(tile, at)', function () {
    it('should overwrite existing tile', function () {
      map.set(Tile.Road, origin)
      assert.ok(map.has([ Tile.Road ], origin))
      assert.strictEqual(map.has(Tile.Block, origin), false)
    })
  })
  describe('set(tile, at[])', function () {
    it('should overwrite existing tiles at multiple coords', function () {
      map.set(Tile.Road, [ origin, { x: 1, y: 0 }, { x: 2, y: 0 }])
      assert.ok(map.has([ Tile.Road ], origin))
      assert.ok(map.has([ Tile.Road ], { x: 1, y: 0 }))
      assert.ok(map.has([ Tile.Road ], { x: 2, y: 0 }))
    })
  })
  describe('set(tile[], at)', function () {
    it('should set multiple tiles', function () {
      map.set([ Tile.Water, Tile.Block ], origin)
      assert.ok(map.has([ Tile.Water, Tile.Block ], origin))
    })
    it('should get default tile when set with nothing', function () {
      map.set([], origin)
      assert.strictEqual(WorldMap.defaultTile, Tile.Grass)
      assert.ok(map.has(Tile.Grass, origin))
      assert.strictEqual(map.get(origin).size, 1)
    })
    it('should ignore incompatible tiles', function () {
      map.set([ Tile.Walkable, Tile.Block, Tile.Road ], origin)
      assert.ok(map.has(Tile.Road, origin))
      assert.strictEqual(map.get(origin).size, 1)

      map.set([ Tile.Burning, Tile.Water, Tile.Road ], origin)
      assert.ok(map.has(Tile.Road, origin))
      assert.strictEqual(map.get(origin).size, 1)

      map.set([ Tile.Burned, Tile.Water ], origin)
      assert.ok(map.has(Tile.Grass, origin))
      assert.strictEqual(map.get(origin).size, 1)
    })
  })
  describe('set(tile[], at[])', function () {
    it('should set multiple tiles & overwrite multiple tiles', function () {
      map.set([ Tile.Water, Tile.Block ], [ origin, { x: 1, y: 0 }])
      assert.ok(map.has([ Tile.Water, Tile.Block ], origin))
      assert.ok(map.has([ Tile.Water ], { x: 1, y: 0 }))
    })
  })

  describe('remove(tile, at)', function () {
    let at: Coords
    beforeEach(function () {
      at = { x: 4, y: 0 }
    })
    it('should remove standalone tile', function () {
      map.set(Tile.Water, at)
      assert.ok(map.has(Tile.Water, at))

      assert.strictEqual(map.has(Tile.Forest, at), false)
      map.remove(Tile.Forest, at)
      assert.strictEqual(map.has(Tile.Forest, at), false)

      map.remove(Tile.Water, at)
      assert.strictEqual(map.has(Tile.Water, at), false)
    })
    it('should remove sidekick', function () {
      map.add(Tile.Burning, at)
      console.log(map.get(at))
      assert.ok(map.has(Tile.Burning, at))
      // Fixme?
      // assert.ok(map.has([ Tile.Burning, WorldMap.defaultTile ], at))
    })
  })

  describe('get(at)', function () {
    it('should returns correct tile', function () {
      const tile = map.get(origin)
      assert.ok(tile.has(Tile.Block))
      assert.strictEqual(tile.has(Tile.Walkable), false)
    })
    it('should returns immutable default tile', function () {
      assert.strictEqual(WorldMap.defaultTile, Tile.Grass)

      const at = { x: 1, y: 0 }
      const tile = map.get(at) // Nothing defined here
      assert.ok(tile.has(Tile.Grass))
      tile.delete(Tile.Grass)
      assert.ok(map.get(at).has(Tile.Grass))
    })
  })

  it('getAround(at)', function () {
    const around = map.getAround({ x: 1, y: 0 })

    assert.strictEqual(around.get(Direction.NorthWest), undefined)
    assert.strictEqual(around.get(Direction.North), undefined)
    assert.strictEqual(around.get(Direction.NorthEast), undefined)

    assert.ok((around.get(Direction.West) as Tileset).has(Tile.Block))
    assert.ok((around.get(Direction.East) as Tileset).has(Tile.Grass), stringifyTileset(around.get(Direction.East) as Tileset))

    assert.ok((around.get(Direction.SouthWest) as Tileset).has(Tile.Grass))
    assert.ok((around.get(Direction.South) as Tileset).has(Tile.Grass))
    assert.ok((around.get(Direction.SouthEast) as Tileset).has(Tile.Grass))
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

    // map.add(Tile.Walkable, origin) // WorldMap.add() now ignores when sidekick erase source tile
    // map.add(Tile.Road, origin)
    map.add([ Tile.Walkable, Tile.Road ], origin) // But works when added with "real/concrete" tile

    assert.ok(map.has(Tile.Road, origin))
    assert.ok(map.isWalkable(origin))
  })

  it('each', function () {
    let iteration = 0
    map.add(Tile.Block, { x: 4, y: 4 })
    map.each(square => {
      iteration++
      if ((square.at.x === 0 && square.at.y === 0) || (square.at.x === 4 && square.at.y === 4)) {
        assert.ok(square.tileset.has(Tile.Block))
      }
    })
    assert.strictEqual(iteration, 2)
  })

  describe('extract', function () {
    it('should throw with invalid surface', function () {
      try {
        map.extract({ x: 3, y: 3 }, { width: 2, height: 3 })
        assert.fail('InvalidArgumentError should have been thrown')
      } catch (e) {
        assert.ok(e instanceof InvalidArgumentError)
        assert.strictEqual(e.message, 'Expected Surface dimensions must be odd')
      }
    })
    describe('a "sub" WorldMap', function () {
      let world: WorldMap
      before(function () {
        // 1 1 1 1 1
        // W . W . W
        // . F . F .
        // B . B . B
        // . . . . R
        world = new WorldMap({ width: 5, height: 5 })
        world.set(Tile.Block, [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }])
        world.set(Tile.Water, [{ x: 0, y: 1 }, { x: 2, y: 1 }, { x: 4, y: 1 }])
        world.set([ Tile.Burning, Tile.Forest ], [{ x: 1, y: 2 }, { x: 3, y: 2 }])
        world.set(Tile.Building, [{ x: 0, y: 3 }, { x: 2, y: 3 }, { x: 4, y: 3 }])
        world.set(Tile.Road, { x: 4, y: 4 })
      })
      it('should return a (small) WorldMap', function () {
        const slice = world.extract({ x: 2, y: 2 }, { width: 3, height: 3 })
        assert.deepStrictEqual(slice.size, { width: 3, height: 3 })

        assert.ok(world.has([], { x: 1, y: 1 }))
        assert.ok(world.has(Tile.Water, { x: 2, y: 1 }))
        assert.ok(world.has([], { x: 3, y: 1 }))

        assert.ok(world.has([ Tile.Burning, Tile.Forest ], { x: 1, y: 2 }))
        assert.ok(world.has([], { x: 2, y: 2 }))
        assert.ok(world.has([ Tile.Burning, Tile.Forest ], { x: 3, y: 2 }))

        assert.ok(world.has([], { x: 1, y: 3 }))
        assert.ok(world.has(Tile.Building, { x: 2, y: 3 }))
        assert.ok(world.has([], { x: 3, y: 3 }))
      })
      it('should return a (small) WorldMap, even when exceeding original WorldMap size', function () {
        const slice = world.extract({ x: 3, y: 4 }, { width: 5, height: 5 })
        assert.deepStrictEqual(slice.size, { width: 4, height: 3 })

        assert.ok(world.has(Tile.Burning, { x: 1, y: 2 }))
        assert.ok(world.has([], { x: 2, y: 2 }))
        assert.ok(world.has(Tile.Burning, { x: 3, y: 2 }))
        assert.ok(world.has([], { x: 4, y: 2 }))

        assert.ok(world.has([], { x: 1, y: 3 }))
        assert.ok(world.has(Tile.Building, { x: 2, y: 3 }))
        assert.ok(world.has([], { x: 3, y: 3 }))
        assert.ok(world.has(Tile.Building, { x: 4, y: 3 }))

        assert.ok(world.has([], { x: 1, y: 4 }))
        assert.ok(world.has([], { x: 2, y: 4 }))
        assert.ok(world.has([], { x: 3, y: 4 }))
        assert.ok(world.has(Tile.Road, { x: 4, y: 4 }))
      })
    })
  })
})
