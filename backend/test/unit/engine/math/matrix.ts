import { matrix } from '#engine/math/index'
import assert from 'assert'

const testMatrix = [[ -3, -2, -1, 0 ], [ 0, 1, 2, 3 ]]

describe('matrix', function () {
  it('create (filled with 0)', function () {
    const array = matrix.create({ width: 3, height: 2 }, 0)
    assert.deepStrictEqual(array, [[ 0, 0, 0 ], [ 0, 0, 0 ]])
  })

  it('create (filled with function)', function () {
    const array = matrix.create({ width: 3, height: 2 }, (x, y) => x + y)
    assert.deepStrictEqual(array, [[ 0, 1, 2 ], [ 1, 2, 3 ]])
  })

  it('min', function () {
    assert.strictEqual(matrix.min(testMatrix), -3)
  })

  it('max', function () {
    assert.strictEqual(matrix.max(testMatrix), 3)
  })

  it('sharpen', function () {
    assert.deepStrictEqual(matrix.sharpen(testMatrix), [[ 3, 2, 1, 0 ], [ 0, 1, 2, 3 ]])
  })

  it('sharpen2', function () {
    assert.deepStrictEqual(matrix.sharpen2(testMatrix), [[ 9, 4, 1, 0 ], [ 0, 1, 4, 9 ]])
  })

  it('normalize', function () {
    assert.deepStrictEqual(matrix.normalize(testMatrix), [[ 0, 0.16666666666666666, 0.3333333333333333, 0.5 ], [ 0.5, 0.6666666666666666, 0.8333333333333334, 1 ]])
  })

  it('cap', function () {
    const expected = [[ -1, -1, -1, 0 ], [ 0, 1, 2, 2 ]]

    assert.deepStrictEqual(matrix.cap(-1, 2, testMatrix), expected)
    const curriedCap = matrix.cap(-1, 2)
    assert.deepStrictEqual(curriedCap(testMatrix), expected)
  })

  it('add', function () {
    const expected = [[ 2, 3, 4, 5 ], [ 5, 6, 7, 8 ]]

    assert.deepStrictEqual(matrix.add(5, testMatrix), expected)
    const curriedAdd = matrix.add(5)
    assert.deepStrictEqual(curriedAdd(testMatrix), expected)
  })

  it('inverse', function () {
    assert.deepStrictEqual(matrix.inverse(testMatrix), [[ 6, 5, 4, 3 ], [ 3, 2, 1, 0 ]])
  })

  it('each', function () {
    matrix.each(entry => {
      assert.strictEqual(entry.value, testMatrix[entry.coords.y][entry.coords.x])
    }, testMatrix)
  })
})
