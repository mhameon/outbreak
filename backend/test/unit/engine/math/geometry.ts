import { calculateDestination } from '@engine/math/geometry'
import assert from 'assert'

describe('geometry', function () {
  const origin = { x: 0, y: 0 }
  it('calculateDestination', function () {
    assert.deepStrictEqual(calculateDestination(origin, 0), { x: 0, y: -1 })
    assert.deepStrictEqual(calculateDestination(origin, 45), { x: 1, y: -1 })
    assert.deepStrictEqual(calculateDestination(origin, 90), { x: 1, y: 0 })
    assert.deepStrictEqual(calculateDestination(origin, 135), { x: 1, y: 1 })
    assert.deepStrictEqual(calculateDestination(origin, 180), { x: 0, y: 1 })
    assert.deepStrictEqual(calculateDestination(origin, 225), { x: -1, y: 1 })
    assert.deepStrictEqual(calculateDestination(origin, 270), { x: -1, y: 0 })
    assert.deepStrictEqual(calculateDestination(origin, 315), { x: -1, y: -1 })

    assert.deepStrictEqual(calculateDestination(origin, 360), { x: 0, y: -1 })
    assert.deepStrictEqual(calculateDestination(origin, 405), { x: 1, y: -1 })
    assert.deepStrictEqual(calculateDestination(origin, 720), { x: 0, y: -1 })

    assert.deepStrictEqual(calculateDestination(origin, -45), { x: -1, y: -1 })
    assert.deepStrictEqual(calculateDestination(origin, -90), { x: -1, y: 0 })
    assert.deepStrictEqual(calculateDestination(origin, -135), { x: -1, y: 1 })
    assert.deepStrictEqual(calculateDestination(origin, -180), { x: 0, y: 1 })
    assert.deepStrictEqual(calculateDestination(origin, -225), { x: 1, y: 1 })
    assert.deepStrictEqual(calculateDestination(origin, -270), { x: 1, y: 0 })
    assert.deepStrictEqual(calculateDestination(origin, -315), { x: 1, y: -1 })
  })
  // it.only('experiment', function () {
  //   const wind = 45
  //   const angle = 45
  //   console.log(
  //     calculateDestination(origin, wind),
  //     calculateDestination(origin, wind - angle),
  //     calculateDestination(origin, wind + angle),
  //   )
  // })
})
