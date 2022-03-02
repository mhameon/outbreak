import { random } from '#engine/math/index'
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
      const range = random.range(1, 2)
      assert.ok(range === 1 || range === 2, `Unexpected random number: ${range}`)
    })
    it('should find integer between -1 and -2', function () {
      const range = random.range(-2, -1)
      assert.ok(range === -1 || range === -2, `Unexpected random number: ${range}`)
    })
    it('should find float between 1.0 and 1.2', function () {
      const range = random.range(1, 1.2, 1)
      assert.ok(range === 1 || range === 1.1 || range === 1.2, `Unexpected random number: ${range}`)
    })
  })
  describe('choose', function () {
    it('should pick a display', function () {
      let almostChosen = random.choose('a', 'b')
      assert.ok(almostChosen === 'a' || almostChosen === 'b', almostChosen)

      almostChosen = random.choose([ 'a', 'b' ])
      assert.ok(almostChosen === 'a' || almostChosen === 'b', almostChosen)
    })
  })

  describe('hex', function () {
    it('generate hex string', function () {
      assert.ok(random.hex(8).search(/^[a-f0-9]{16}$/i) !== -1)
    })
  })
})
