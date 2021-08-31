import { tilerules, getSanitizedTileset, getRenderTile } from '@engine/map/tilerules'
import assert from 'assert'
import { stringifyTiles, UnknownRenderTile } from '@engine/map/WorldMapErrors'
import { Tile, RenderTile } from '@engine/types'

describe('tilerules', function () {
  describe('Data validation', function () {
    //
    // Theses tests ensure tilerules are correctly formatted
    //
    describe('Exclusions', function () {
      it('declarations are sorted in descending order', function () {
        let size = 999
        tilerules.exclusions.forEach(exclusion => {
          assert.ok(exclusion.length <= size)
          size = exclusion.length
        })
      })
    })
    describe('Rendering', function () {
      it('declarations are sorted in descending order', function () {
        let size = 999
        tilerules.rendering.forEach(({ and }) => {
          assert.ok(and.length <= size)
          size = and.length
        })
      })
      it('aren\'t defined with exclusives tiles', function () {
        tilerules.rendering.forEach(({ and }) => {
          const tileset = new Set(and)
          tilerules.exclusions.forEach(excluded => {
            if (excluded.every(tile => tileset.has(tile))) {
              assert.fail(`Additives tiles can't be composed by mutually exclusives tiles ${stringifyTiles(tileset)}`)
            }
          })
        })
      })
    })
  })

  describe('Utility functions', function () {
    describe('getSanitizedTileset', function () {
      it('should return a sanitized tileset', function () {
        assert.strictEqual(getSanitizedTileset([ Tile.Block, Tile.Walkable ]).size, 0)
        assert.strictEqual(getSanitizedTileset([ Tile.Water, Tile.Burning ]).size, 0)
        assert.strictEqual(getSanitizedTileset([ Tile.Burned, Tile.Burning ]).size, 0)
        assert.strictEqual(getSanitizedTileset(new Set([ Tile.Burned ])).size, 1)
      })
      it('should cleanup orphan Sidekick tiles', function () {
        assert.strictEqual(getSanitizedTileset([ Tile.Burned ], true).size, 0)
      })
    })
    describe('getRenderTile', function () {
      it('should find a "double" render tile (Bridge) in any order', function () {
        assert.strictEqual(getRenderTile([ Tile.Road, Tile.Water ]), RenderTile.Bridge)
        assert.strictEqual(getRenderTile([ Tile.Water, Tile.Road ]), RenderTile.Bridge)
      })
      it('should find a "triple" render tile (BurningBuildingL1) in any order', function () {
        assert.strictEqual(getRenderTile([ Tile.Burning, Tile.Building, Tile.Level1 ]), RenderTile.BurningBuildingL1)
        assert.strictEqual(getRenderTile([ Tile.Burning, Tile.Level1, Tile.Building ]), RenderTile.BurningBuildingL1)
        assert.strictEqual(getRenderTile([ Tile.Level1, Tile.Burning, Tile.Building, ]), RenderTile.BurningBuildingL1)
        assert.strictEqual(getRenderTile([ Tile.Level1, Tile.Building, Tile.Burning ]), RenderTile.BurningBuildingL1)
        assert.strictEqual(getRenderTile([ Tile.Building, Tile.Level1, Tile.Burning ]), RenderTile.BurningBuildingL1)
        assert.strictEqual(getRenderTile([ Tile.Building, Tile.Burning, Tile.Level1 ]), RenderTile.BurningBuildingL1)
      })
      it('should find a standalone tile (Water)', function () {
        assert.strictEqual(getRenderTile([ Tile.Water ]), RenderTile.Water)
      })
      it('should throw for unknown rendering tile', function () {
        try {
          getRenderTile([ Tile.Forest, Tile.Road ])
          assert.fail('should have been throw UnknownRenderTile')
        } catch (e) {
          assert.ok(e instanceof UnknownRenderTile)
          assert.strictEqual(e.message, 'No RenderTile found for tiles [101/Forest, 102/Road]')
        }
      })
    })
  })
})
