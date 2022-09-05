import { WorldMap } from '#engine/map/WorldMap'
import { Tile, Direction, Tileset, Coords } from '#engine/types'

import * as assert from '../../shared/assert'
import { InvalidArgumentError } from '#shared/Errors'
import { stringifyTiles } from '#engine/map/WorldMapErrors'
import { WorldMapEvents } from '#engine/events'

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

  describe('add()', function () {
    let tileAddedEvents: Array<WorldMapEvents['tile:added']>
    beforeEach(function () {
      tileAddedEvents = []
      map.on('tile:added', (args) => {
        tileAddedEvents.push(args)
      })
    })
    afterEach(function () {
      return map.removeAllListeners('tile:added')
    })

    it('should not duplicate tiles', function () {
      map.add(Tile.Block, origin)
      const tiles = map.get(origin)
      assert.strictEqual(tiles.size, 1)
    })

    describe('add(tile, at)', function () {
      const at = { x: 1, y: 1 }
      it('should add a tile at coords', function () {
        assert.ok(map.has(Tile.Block, origin))
      })
      it('should not add tiles twice', function () {
        map.on(`tile:${Tile.Water}:added`, ({ at }) => {
          assert.strictEqual(at, origin)
        })
        assert.strictEqual(map.add(Tile.Block, origin), 0)
        assert.strictEqual(map.add(Tile.Block, origin), 0)
        assert.strictEqual(map.add(Tile.Water, origin), 1)
        assert.strictEqual(map.add(Tile.Water, origin), 0)
        assert.strictEqual(map.get(origin).size, 2)
        assert.deepTileAddedEqual(tileAddedEvents, [{
          tile: Tile.Water,
          at: origin,
          originalTileset: [ Tile.Block ]
        }])
      })
      it('should not possible to burn water', function () {
        map.set(Tile.Water, at)
        assert.ok(map.has(Tile.Water, at))
        assert.strictEqual(map.get(at).size, 1)

        assert.strictEqual(map.add(Tile.Burning, at), 0)
        assert.ok(map.has(Tile.Water, at))
        assert.strictEqual(map.get(at).size, 1)
        assert.deepStrictEqual(tileAddedEvents, [])

        map.set([ Tile.Water, Tile.Block ], at)
        assert.ok(map.has([ Tile.Water, Tile.Block ], at))
        assert.strictEqual(map.get(at).size, 2)

        assert.strictEqual(map.add([ Tile.Burning, Tile.Zombie ], at), 1)
        assert.ok(map.has([ Tile.Water, Tile.Block, Tile.Zombie ], at))
        assert.strictEqual(map.get(at).size, 3)
      })
      it('should not possible to burn already burned ground', function () {
        map.set([ Tile.Burned, Tile.Grass ], at)
        assert.ok(map.has([ Tile.Burned, Tile.Grass ], at))

        // FIXME: an added sidekick tile that "cancel" an ALREADY existing sidekick tile must be striped !
        // Allow to remove `if (ground.has(Tile.Burned)) return false`in FireResolver:L82
        map.add(Tile.Burning, at)
        assert.ok(map.has([ Tile.Burned, Tile.Grass ], at))
      })
    })
    describe('add(tile, at[])', function () {
      it('should add a tile at multiple coords', function () {
        assert.strictEqual(map.add(Tile.Road, [ origin, { x: 1, y: 0 }, { x: 2, y: 0 }]), 3)
        assert.ok(map.has([ Tile.Road, Tile.Block ], origin))
        assert.ok(map.has(Tile.Road, { x: 1, y: 0 }))
        assert.ok(map.has(Tile.Road, { x: 2, y: 0 }))
        assert.deepTileAddedEqual(tileAddedEvents, [
          { tile: Tile.Road, at: origin, originalTileset: [ Tile.Block ] },
          { tile: Tile.Road, at: { x: 1, y: 0 }, originalTileset: [] },
          { tile: Tile.Road, at: { x: 2, y: 0 }, originalTileset: [] }
        ])
      })
      it('should add nothing with an empty at coords', function () {
        assert.strictEqual(map.add(Tile.Road, new Set<Coords>()), 0)
        assert.strictEqual(map.add(Tile.Road, []), 0)
      })
    })
    describe('add(tile[], at)', function () {
      const at = { x: 1, y: 0 }
      it('should add multiple tile (array<Tile>) at coords', function () {
        assert.strictEqual(map.add([ Tile.Water, Tile.Burning, Tile.Forest ], at), 1)
        assert.strictEqual(map.get(at).size, 1)
        assert.ok(map.has([ Tile.Forest ], at))

        assert.strictEqual(map.add([ Tile.Water, Tile.Burning, Tile.Forest ], origin), 1)
        assert.strictEqual(map.get(origin).size, 2)
        assert.ok(map.has([ Tile.Forest, Tile.Block ], origin))
      })
      it('should add multiple tile (Tileset) at coords', function () {
        assert.strictEqual(map.add(new Set([ Tile.Water, Tile.Burning, Tile.Forest ]), at), 1)
        assert.strictEqual(map.get(at).size, 1)
        assert.ok(map.has([ Tile.Forest ], at))

        assert.strictEqual(map.add(new Set([ Tile.Water, Tile.Burning, Tile.Forest ]), origin), 1)
        assert.strictEqual(map.get(origin).size, 2)
        assert.ok(map.has([ Tile.Forest, Tile.Block ], origin))
      })
    })
  })

  describe('set', function () {
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
      it('should ignore incompatible tiles', function () {
        map.set([ Tile.Walkable, Tile.Block, Tile.Road ], origin)
        assert.ok(map.has(Tile.Road, origin))
        assert.strictEqual(map.get(origin).size, 1)

        map.set([ Tile.Burning, Tile.Water, Tile.Road ], origin)
        assert.ok(map.has(Tile.Road, origin))
        assert.strictEqual(map.get(origin).size, 1)

        map.set([ Tile.Burned, Tile.Water ], origin)
        assert.ok(map.get(origin), undefined)
        assert.strictEqual(map.get(origin).size, 0)
      })
    })
    describe('set(tile[], at[])', function () {
      it('should set multiple tiles & overwrite multiple tiles', function () {
        map.set([ Tile.Water, Tile.Block ], [ origin, { x: 1, y: 0 }])
        assert.ok(map.has([ Tile.Water, Tile.Block ], origin))
        assert.ok(map.has([ Tile.Water ], { x: 1, y: 0 }))
      })
    })
  })

  describe('remove(tile, at)', function () {
    const at = { x: 4, y: 0 }
    it('should remove standalone tile', function () {
      map.set(Tile.Water, at)
      assert.ok(map.has(Tile.Water, at))

      assert.strictEqual(map.has(Tile.Forest, at), false)
      assert.strictEqual(map.remove(Tile.Forest, at), 0)
      assert.strictEqual(map.has(Tile.Forest, at), false)

      assert.strictEqual(map.remove(Tile.Water, at), 1)
      assert.strictEqual(map.has(Tile.Water, at), false)
    })
    it('should remove sidekick', function () {
      map.add(Tile.Burning, at)
      assert.ok(map.has(Tile.Burning, at))
    })
    it('should remove nothing when it\'s outside the map', function () {
      assert.strictEqual(map.remove(Tile.Forest, { x: -1, y: -1 }), 0)
    })
  })

  describe('replace', function () {
    it('should replace wanted tile', function () {
      map.replace(Tile.Block, Tile.Forest, origin)
      assert.ok(map.has(Tile.Forest, origin))
    })
    it('should do nothing when there is no wanted tile', function () {
      map.replace(Tile.Water, Tile.Forest, origin)
      assert.ok(map.has(Tile.Block, origin))
    })
    it('should replace tiles on multiple coords', function () {
      const at = { x: 1, y: 0 }
      map.replace(Tile.Block, Tile.Forest, [ origin, at ])
      assert.ok(map.has(Tile.Forest, origin))
      assert.strictEqual(map.has(Tile.Forest, at), false)
    })
    it('should delete tile when passing null', function () {
      map.replace(Tile.Block, null, origin)
      assert.ok(!map.has(Tile.Forest, origin))
      assert.ok(map.has(WorldMap.defaultTile, origin))
    })
  })

  describe('find(at)', function () {
    it('should returns correct tile with Coords', function () {
      const tile = map.get(origin)
      assert.ok(tile.has(Tile.Block))
      assert.strictEqual(tile.has(Tile.Walkable), false)
    })
    it('should returns correct tile with Index', function () {
      const tile = map.get('0,0')
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
    assert.ok((around.get(Direction.East) as Tileset).has(Tile.Grass), stringifyTiles(around.get(Direction.East) as Tileset))

    assert.ok((around.get(Direction.SouthWest) as Tileset).has(Tile.Grass))
    assert.ok((around.get(Direction.South) as Tileset).has(Tile.Grass))
    assert.ok((around.get(Direction.SouthEast) as Tileset).has(Tile.Grass))
  })

  describe('has', function () {
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
  })

  it('isWalkable(at)', function () {
    assert.strictEqual(map.isWalkable(origin), false)
    assert.ok(map.isWalkable({ x: 1, y: 0 }))
  })

  it('fails when working outside the map', function () {
    const outside = { x: 10, y: 10 }
    assert.strictEqual(map.contains(outside), false)
    assert.strictEqual(map.has(Tile.Block, outside), false)

    const error = /Coords 10,10 is outside map \(5x5\)/
    assert.throws(() => map.isWalkable(outside), error)
    assert.throws(() => map.get(outside), error)
  })

  it.skip('should remove `Tile.Block` when adding `Tile.Walkable`', function () {
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

  describe('getNeighborsCoords', function () {
    it('should find all 8 neighbors', function () {
      const neighbors = map.getNeighborsCoords({ x: 1, y: 1 })
      assert.strictEqual(neighbors.length, 8)
      assert.deepStrictEqual(neighbors, [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 1 },
        { x: 2, y: 1 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 }
      ])
    })
    it('should find all 5 neighbors at the map edge', function () {
      const neighbors = map.getNeighborsCoords({ x: 0, y: 1 })
      assert.strictEqual(neighbors.length, 5)
      assert.deepStrictEqual(neighbors, [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 2 },
        { x: 1, y: 2 }
      ])
    })
  })

  describe('extract', function () {
    it('should throw with invalid surface', function () {
      try {
        map.extract({ x: 3, y: 3 }, { width: 2, height: 3 })
        assert.fail('InvalidArgumentError should have been thrown')
      } catch (e) {
        assert.ok(e instanceof InvalidArgumentError)
        assert.strictEqual(e.message, 'surface Size must be odd')
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

  describe('helpers', function () {
    it('should stringify tiles', function () {
      assert.strictEqual(stringifyTiles(Tile.Forest), '[101/Forest]')
      assert.strictEqual(stringifyTiles([ Tile.Building, Tile.Level5 ]), '[104/Building, 16/Level5]')
      assert.strictEqual(stringifyTiles(new Set([ Tile.Building, Tile.Level5 ])), '[104/Building, 16/Level5]')
    })
  })
})
