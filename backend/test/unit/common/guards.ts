import assert from 'assert'
import { isNumber } from '#common/guards'
import { isObject } from '#shared/guards'

describe('Common type guards', function () {
  it('isObject', function () {
    assert.ok(isObject({ an: 'object' }))
    assert.strictEqual(isObject('NotAnObject'), false)
    assert.strictEqual(isObject(2), false)
    assert.strictEqual(isObject(null), false)
  })
  it('isNumber', function () {
    assert.ok(isNumber(0))
    assert.ok(isNumber(1))
    assert.ok(isNumber('5'))
    assert.strictEqual(isNumber('zero'), false)
  })
})
