import { calculateDestination, calculateAngleInDegrees, calculateDirection } from '#engine/math/geometry'
import assert from 'assert'
import { Direction } from '#engine/types'

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
  it('calculateAngleInDegrees', function () {
    assert.deepStrictEqual(calculateAngleInDegrees(origin, { x: 0, y: -1 }), 0)
    assert.deepStrictEqual(calculateAngleInDegrees(origin, { x: 1, y: -1 }), 45)
    assert.deepStrictEqual(calculateAngleInDegrees(origin, { x: 1, y: 0 }), 90)
    assert.deepStrictEqual(calculateAngleInDegrees(origin, { x: 1, y: 1 }), 135)
    assert.deepStrictEqual(calculateAngleInDegrees(origin, { x: 0, y: 1 }), 180)
    assert.deepStrictEqual(calculateAngleInDegrees(origin, { x: -1, y: 1 }), 225)
    assert.deepStrictEqual(calculateAngleInDegrees(origin, { x: -1, y: 0 }), 270)
    assert.deepStrictEqual(calculateAngleInDegrees(origin, { x: -1, y: -1 }), 315)
  })

  it('calculateDirection', function () {
    assert.deepStrictEqual(calculateDirection(origin, { x: 0, y: -1 }), Direction.North)
    assert.deepStrictEqual(calculateDirection(origin, { x: 2, y: -10 }), Direction.North)

    assert.deepStrictEqual(calculateDirection(origin, { x: 1, y: -1 }), Direction.NorthEast)
    assert.deepStrictEqual(calculateDirection(origin, { x: 1, y: 0 }), Direction.East)
    assert.deepStrictEqual(calculateDirection(origin, { x: 1, y: 1 }), Direction.SouthEast)

    assert.deepStrictEqual(calculateDirection(origin, { x: 0, y: 1 }), Direction.South)
    assert.deepStrictEqual(calculateDirection({ x: 6, y: 5 }, { x: 6, y: 6 }), Direction.South)

    assert.deepStrictEqual(calculateDirection(origin, { x: -1, y: 1 }), Direction.SouthWest)
    assert.deepStrictEqual(calculateDirection(origin, { x: -1, y: 0 }), Direction.West)

    assert.deepStrictEqual(calculateDirection(origin, { x: -1, y: -1 }), Direction.NorthWest)
    assert.deepStrictEqual(calculateDirection(origin, { x: -10, y: -5 }), Direction.NorthWest)
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
