import { random } from '#engine/math'
import assert from 'assert'

// By definition random can't be tested. But some edge cases, values are predictable...
describe('random', function () {
  describe('chance', function () {
    it('should never occurs with 0% chance (or less)', function () {
      assert.strictEqual(random.chance(0), false)
      assert.strictEqual(random.chance(-100), false)
    })
    it('should always occurs with 100% chance (or more)', function () {
      assert.strictEqual(random.chance(100), true)
      assert.strictEqual(random.chance(110), true)
    })
  })
  describe('range', function () {
    it('should find integer between 1 and 2', function () {
      expectDifferentResults(2, () => {
        const range = random.range(1, 2)
        assert.ok([ 1, 2 ].includes(range), `Unexpected random number: ${range}`)
        return range
      })
    })
    it('should find integer between -1 and -2', function () {
      expectDifferentResults(2, () => {
        const range = random.range(-2, -1)
        assert.ok([ -1, -2 ].includes(range), `Unexpected random number: ${range}`)
        return range
      })
    })
    it('should find float between 1.0 and 1.2', function () {
      expectDifferentResults(3, () => {
        const range = random.range(1, 1.2, 1)
        assert.ok([ 1, 1.1, 1.2 ].includes(range), `Unexpected random number: ${range}`)
        return range
      })
    })
  })
  describe('choose', function () {
    it('should choose a value from values', function () {
      expectDifferentResults(2, () => {
        const almostChosen = random.choose('a', 'b')
        assert.ok([ 'a', 'b' ].includes(almostChosen))
        return almostChosen
      })
    })
    it('should choose a value from array of values', function () {
      expectDifferentResults(2, () => {
        const almostChosen = random.choose([ 'a', 'b' ])
        assert.ok([ 'a', 'b' ].includes(almostChosen))
        return almostChosen
      })
    })
  })
  describe('hex', function () {
    it('should generate hex string', function () {
      assert.ok(/^[a-f0-9]{16}$/i.test(random.hex(8)))
    })
  })
})

/**
 * Run `assertion` `iteration` times and expect `howMany` different results.
 */
function expectDifferentResults (howMany: number, assertion: () => string | number, iteration = 15): void {
  const distribution: Record<string, number> = {}
  for (let i = 0; i < iteration; i++) {
    const value = assertion()
    distribution[`R${value}`] = (distribution[`R${value}`] ?? 0) + 1
  }
  assert.strictEqual(Object.entries(distribution).length, howMany)
}
