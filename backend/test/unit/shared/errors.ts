import { expect, UnexpectedError, InvalidArgumentError, NotFoundError } from '#shared/Errors'
import assert from 'assert'

describe('Errors', function () {
  describe('expect', function () {
    it('should throw UnexpectedError', function () {
      try {
        expect(new Error('Not an InvalidArgumentError'), InvalidArgumentError)
        assert.fail('Should have thrown UnexpectedError')
      } catch (e) {
        assert.ok(e instanceof UnexpectedError)
      }
    })
    it('should not throw UnexpectedError', function () {
      try {
        expect(new NotFoundError('not not found'), [ InvalidArgumentError, NotFoundError ])
        assert.ok(true)
      } catch (e) {
        assert.fail('Should have not thrown UnexpectedError')
      }
    })
  })
})
