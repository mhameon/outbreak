import type { Coords } from '#shared/types'
import assert from 'assert'
import type { Tile } from '#engine/types'
import type { WorldMapEvents } from '#engine/events'

export function deepTileAddedEqual (actual: Array<WorldMapEvents['tile:added']>, expected: Array<{
  tile: Tile
  at: Coords
  originalTileset: Array<Tile>
}>): void {
  assert.ok(actual.length === expected.length)
  expected.forEach((event, index) => {
    assert.strictEqual(event.tile, expected[index].tile)
    assert.strictEqual(event.at, expected[index].at)
    assert.deepStrictEqual([ ...event.originalTileset ], expected[index].originalTileset)
  })
}

export const ok: typeof assert.ok = assert.ok
export const fail: typeof assert.fail = assert.fail
export const deepStrictEqual: typeof assert.deepStrictEqual = assert.deepStrictEqual
export const notStrictEqual: typeof assert.notStrictEqual = assert.notStrictEqual
export const strictEqual: typeof assert.strictEqual = assert.strictEqual
export const rejects: typeof assert.rejects = assert.rejects
export const doesNotReject: typeof assert.doesNotReject = assert.doesNotReject
export const ifError: typeof assert.ifError = assert.ifError
export const throws: typeof assert.throws = assert.throws
