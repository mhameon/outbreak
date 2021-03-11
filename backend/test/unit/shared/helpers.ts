import assert from 'assert'
import { toArray, toSet } from '@shared/helpers'

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
})
