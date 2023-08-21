/* eslint-disable @typescript-eslint/no-explicit-any */
import { isCoords, isCoordsArray, isMatrix2d, isWorldMap, isIndex } from '#engine/guards'
import * as assert from 'assert'
import { WorldMap } from '#engine/map/WorldMap'

describe('Map type guards', function () {
  it('isCoords', function () {
    assert.ok(isCoords({ x: 0, y: 0 }))
    assert.strictEqual(isCoords({ x: null, y: undefined }), false)
    assert.strictEqual(isCoords('notCoords'), false)
    assert.strictEqual(isCoords(undefined), false)
  })

  it('isIndex', function () {
    assert.ok(isIndex('1,2'))
    assert.strictEqual(isIndex('a,b'), false)
    assert.strictEqual(isIndex('1,'), false)
    assert.strictEqual(isIndex('1-2'), false)
  })

  it('isCoordsArray', function () {
    assert.ok(isCoordsArray([{ x: 0, y: 0 }]))
    assert.strictEqual(isCoordsArray([{ x: null, y: undefined }]), false)
    assert.strictEqual(isCoordsArray('notCoords'), false)
  })

  it('isMatrix2d', function () {
    assert.strictEqual(isMatrix2d([ 0, 0 ]), false)
    assert.ok(isMatrix2d([[ 0, 0 ]]))
    assert.strictEqual(isMatrix2d([[[ 0, 0 ]]]), false)
  })

  it('isWorldMap', function () {
    assert.ok(isWorldMap(new WorldMap({ width: 5, height: 5 })))
    assert.strictEqual(isWorldMap('toto'), false)
  })
})
