import assert from 'assert'
import { validate } from '#shared/validator'
import { isNumber } from '#engine/guards'
import { InvalidArgumentError } from '#shared/Errors'

describe('validator', function () {
  it('reject with default message', function () {
    try {
      validate('a', isNumber)
      assert.fail('InvalidArgumentError should have been thrown')
    } catch (e) {
      assert.ok(e instanceof InvalidArgumentError)
      assert.strictEqual(e.message, 'Argument validation fails with isNumber')
    }
  })
  it('reject with custom message', function () {
    try {
      validate('a', isNumber, 'custom message')
      assert.fail('InvalidArgumentError should have been thrown')
    } catch (e) {
      assert.ok(e instanceof InvalidArgumentError)
      assert.strictEqual(e.message, 'custom message')
    }
  })
})
