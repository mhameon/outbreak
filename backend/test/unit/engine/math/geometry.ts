import {
  calculateDestination,
  calculateAngleInDegrees,
  isAdjacent,
  groupAdjacent,
  closestDirection
} from '#engine/math/geometry'
import assert from 'node:assert'
import { Direction } from '#engine/types'
import { random } from '#engine/math'

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

  describe('closestDirection', function () {
    it('with angle', function () {
      assert.strictEqual(closestDirection(-10), Direction.North)
      assert.strictEqual(closestDirection(0), Direction.North)
      assert.strictEqual(closestDirection(15), Direction.North)
      assert.strictEqual(closestDirection(40), Direction.NorthEast)
    })
    it('with Coords', function () {
      assert.strictEqual(closestDirection(origin, { x: 0, y: -1 }), Direction.North)
      assert.strictEqual(closestDirection(origin, { x: 2, y: -10 }), Direction.North)

      assert.strictEqual(closestDirection(origin, { x: 1, y: -1 }), Direction.NorthEast)
      assert.strictEqual(closestDirection(origin, { x: 1, y: 0 }), Direction.East)
      assert.strictEqual(closestDirection(origin, { x: 1, y: 1 }), Direction.SouthEast)

      assert.strictEqual(closestDirection(origin, { x: 0, y: 1 }), Direction.South)
      assert.strictEqual(closestDirection({ x: 6, y: 5 }, { x: 6, y: 6 }), Direction.South)

      assert.strictEqual(closestDirection(origin, { x: -1, y: 1 }), Direction.SouthWest)
      assert.strictEqual(closestDirection(origin, { x: -1, y: 0 }), Direction.West)

      assert.strictEqual(closestDirection(origin, { x: -1, y: -1 }), Direction.NorthWest)
      assert.strictEqual(closestDirection(origin, { x: -10, y: -5 }), Direction.NorthWest)
    })
  })

  it('isAdjacent', function () {
    assert.strictEqual(isAdjacent({ x: -1, y: -1 }, { x: 0, y: 0 }), true)

    assert.strictEqual(isAdjacent({ x: 1, y: 1 }, { x: 0, y: 0 }), true)
    assert.strictEqual(isAdjacent({ x: 1, y: 1 }, { x: 1, y: 0 }), true)
    assert.strictEqual(isAdjacent({ x: 1, y: 1 }, { x: 2, y: 0 }), true)
    assert.strictEqual(isAdjacent({ x: 1, y: 1 }, { x: 0, y: 1 }), true)
    assert.strictEqual(isAdjacent({ x: 1, y: 1 }, { x: 1, y: 1 }), true)
    assert.strictEqual(isAdjacent({ x: 1, y: 1 }, { x: 2, y: 1 }), true)
    assert.strictEqual(isAdjacent({ x: 1, y: 1 }, { x: 0, y: 2 }), true)
    assert.strictEqual(isAdjacent({ x: 1, y: 1 }, { x: 1, y: 2 }), true)
    assert.strictEqual(isAdjacent({ x: 1, y: 1 }, { x: 2, y: 2 }), true)

    assert.strictEqual(isAdjacent({ x: 1, y: 1 }, { x: 3, y: 0 }), false)
    assert.strictEqual(isAdjacent({ x: 1, y: 1 }, { x: 1, y: 3 }), false)
  })

  it('groupAdjacent', function () {
    /***************
     * X X . . . X *
     * X . . . . X *
     * . . . X . X *
     * . . X X . . *
     * X . . X . . *
     * X X . . . X *
     ***************/
    const coords = [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 },
      { x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 2 },
      { x: 0, y: 4 }, { x: 0, y: 5 }, { x: 1, y: 5 },
      { x: 3, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 3, y: 4 },
      { x: 5, y: 5 }
    ]

    const grouped = [
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }],
      [{ x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 2 }],
      [{ x: 0, y: 4 }, { x: 0, y: 5 }, { x: 1, y: 5 }],
      [{ x: 3, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 3, y: 4 }],
      [{ x: 5, y: 5 }]
    ]
    assert.deepStrictEqual(groupAdjacent(coords), grouped)

    // Same coords, different order.
    const randomizedCoords = random.shuffle([
      { x: 2, y: 3 }, { x: 1, y: 0 }, { x: 0, y: 1 },
      { x: 5, y: 1 }, { x: 3, y: 2 }, { x: 5, y: 2 },
      { x: 0, y: 4 }, { x: 0, y: 5 }, { x: 0, y: 0 }, { x: 1, y: 5 },
      { x: 3, y: 3 }, { x: 3, y: 4 },
      { x: 5, y: 5 }, { x: 5, y: 0 }
    ])
    assert.strictEqual(groupAdjacent(randomizedCoords).length, 5)

    // We have to reorder groups to test their content
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
