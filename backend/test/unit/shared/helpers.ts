import assert from 'assert'
import { toArray, toSet, pipe, deleteInSet } from '#common/helpers'
import { Tile } from '#engine/types'

describe('shared helpers', function () {
  const num = 12, obj = { obj: true }
  const arrayNum = [ num ], arrayObj = [ obj ]
  describe('toArray', function () {
    it('should return Array<T> with T', function () {
      assert.deepStrictEqual(toArray(num), arrayNum)
      assert.deepStrictEqual(toArray(obj), arrayObj)
    })
    it('should return Array<T> with Array<T>', function () {
      assert.deepStrictEqual(toArray(num), arrayNum)
      assert.deepStrictEqual(toArray(obj), arrayObj)
    })
    it('should return Array<T> with Set<T>', function () {
      assert.deepStrictEqual(toArray(new Set(arrayNum)), arrayNum)
      assert.deepStrictEqual(toArray(new Set(arrayObj)), arrayObj)
    })
  })

  describe('toSet', function () {
    const setNum = new Set(arrayNum), setObj = new Set(arrayObj)
    it('should return Set<T> with T', function () {
      assert.deepStrictEqual(toSet(num), setNum)
      assert.deepStrictEqual(toSet(obj), setObj)
    })
    it('should return Set<T> with Array<T>', function () {
      assert.deepStrictEqual(toSet([ num ]), setNum)
      assert.deepStrictEqual(toSet([ obj ]), setObj)
    })
    it('should return Set<T> with Set<T>', function () {
      assert.deepStrictEqual(toSet(setNum), setNum)
      assert.deepStrictEqual(toSet(setObj), setObj)
    })
  })

  describe('pipe', function () {
    it('should run all functions in the pipe', function () {
      const addOne = (value: number): number => value + 1
      const sum = pipe(0)(addOne, addOne, addOne)
      assert.strictEqual(sum, 3)
    })
  })

  describe('deleteInSet', function () {
    it('should purge strings', function () {
      const set = deleteInSet(
        new Set([ 'a', 'b', 'c' ]),
        new Set([ 'b', 12 ])
      )
      assert.strictEqual(set.size, 2)
      assert.strictEqual(set.has('a'), true)
      assert.strictEqual(set.has('c'), true)
    })

    it('should purge Tileset', function () {
      const set = deleteInSet(
        new Set([ Tile.Burning, Tile.Building, Tile.Level3 ]),
        new Set([ Tile.Burning ]),
      )
      assert.strictEqual(set.size, 2)
      assert.strictEqual(set.has(Tile.Building), true)
      assert.strictEqual(set.has(Tile.Level3), true)
    })
  })
})
