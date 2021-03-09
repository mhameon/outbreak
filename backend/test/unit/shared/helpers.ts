import assert from 'assert'
import { toArray, toSet } from '@shared/helpers'

describe('shared helpers', function () {
  const num = 12
  const obj = { obj: true }
  const arrayNum = [ num ]
  const arrayObj = [ obj ]
  describe('toArray', function () {
    it('should return Array with item', function () {
      assert.deepStrictEqual(toArray(num), arrayNum)
      assert.deepStrictEqual(toArray(obj), arrayObj)
    })
    it('should return Array with Array<item>', function () {
      assert.deepStrictEqual(toArray(num), arrayNum)
      assert.deepStrictEqual(toArray(obj), arrayObj)
    })
    it('should return Array with Set<item>', function () {
      assert.deepStrictEqual(toArray(new Set(arrayNum)), arrayNum)
      assert.deepStrictEqual(toArray(new Set(arrayObj)), arrayObj)
    })
  })
  describe('toSet', function () {
    const setNum = new Set(arrayNum)
    const setObj = new Set(arrayObj)
    it('should return Set<item> with item', function () {
      assert.deepStrictEqual(toSet(num), setNum)
      assert.deepStrictEqual(toSet(obj), setObj)
    })
    it('should return Set<item> with Array<item>', function () {
      assert.deepStrictEqual(toSet([ num ]), setNum)
      assert.deepStrictEqual(toSet([ obj ]), setObj)
    })
    it('should return Set<item> with Set<item>', function () {
      assert.deepStrictEqual(toSet(setNum), setNum)
      assert.deepStrictEqual(toSet(setObj), setObj)
    })
  })
})
