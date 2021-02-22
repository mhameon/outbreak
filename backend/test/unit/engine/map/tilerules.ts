import { tilerules, getSanitizedTileset } from '@engine/map/tilerules'
import assert from 'assert'
import { stringifyTileset, SidekickTileLonelyUsageError } from '@engine/map/WorldMapErrors'
import { Tile } from '@engine/types'

describe('tilerules', function () {
  describe('Data validation', function () {
    //
    // Theses tests ensure tilerules are correctly formatted
    //
    describe('Additive tiles', function () {
      it('are sorted in ascending order', function () {
        let size = 999
        tilerules.additives.forEach(({ and }) => {
          assert.ok(and.length <= size)
          size = and.length
        })
      })
      it('aren\'t composed with exclusives tiles', function () {
        tilerules.additives.forEach(({ and }) => {
          const tileset = new Set(and)
          tilerules.exclusions.forEach(excluded => {
            if (excluded.every(tile => tileset.has(tile))) {
              assert.fail(`Additives tiles can't be composed by mutually exclusives tiles [${stringifyTileset(tileset).join(', ')}]}`)
            }
          })
        })
      })
    })
  })

  describe('functions', function() {
    describe('getSanitizedTileset', function() {
      it('should return a sanitized tileset', function() {
        assert.strictEqual(getSanitizedTileset([ Tile.Block, Tile.Walkable ]).size, 0)
        assert.strictEqual(getSanitizedTileset([ Tile.Water, Tile.Fire ]).size, 0)
        assert.strictEqual(getSanitizedTileset([ Tile.Burned, Tile.Fire ]).size, 0)
        assert.strictEqual(getSanitizedTileset([ Tile.Burned ]).size, 1)
      })
      it('should throw when using lone Sidekick tiles', function() {
        try {
          getSanitizedTileset([ Tile.Burned ], true)
          assert.fail('SidekickTileLonelyUsageError should have been thrown')
        } catch (e) {
          assert.ok(e instanceof SidekickTileLonelyUsageError)
          assert.strictEqual(e.message, 'Sidekick tile "Burned" is used lonely in tileset [Burned]')
        }
      })
    })
  })
})
