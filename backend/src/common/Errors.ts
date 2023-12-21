import config from 'config'
import { LeveledLogMethod } from 'winston'
import { getLogger, LogMethod } from './logger'
import { OneOrMany } from '#common/types'
import assert from 'assert'
import { toArray } from '#common/helpers'

let logErrorWithDefaultLevel: LogMethod
if (config.get('logger.exception')) {
  logErrorWithDefaultLevel = getLogger('Exception').error
}

/**
 * Ensure error is one of the expected. Typically used in `catch` block.
 * @throws {UnexpectedError} if `error` isn't in `toBeInstanceOf`
 */
export function expect (error: unknown, toBeInstanceOf: OneOrMany<Error | unknown>): void {
  assert(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toArray<any>(toBeInstanceOf).some(err => error instanceof err),
    new UnexpectedError(error)
  )
}

export abstract class CustomError extends Error {
  constructor (message?: string, logErrorWith?: LeveledLogMethod | boolean) {
    super(message)
    this.name = this.constructor.name
    if (logErrorWith) {
      logErrorWith === true
        ? logErrorWithDefaultLevel(message)
        : logErrorWith(message)
    }
  }
}

export class InvalidArgumentError extends CustomError {
}

export class NotFoundError extends CustomError {
  constructor (id: string | number, type?: string, logErrorWith?: LogMethod) {
    super(`"${id}" ${type ? `is an unknown ${type}` : 'not found'}`, logErrorWith)
  }
}

export class RuntimeError extends CustomError {
  constructor (message ?: string) {
    super(message ?? 'Something goes wrong')
  }
}

export class UnexpectedError extends CustomError {
  constructor (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super((error as any)?.message ?? 'UnexpectedError: WTF, it\'s not supposed to happen ?!')
  }
}
