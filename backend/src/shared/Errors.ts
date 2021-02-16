import config from 'config'
import { LeveledLogMethod } from 'winston'
import { getLogger, LogMethod } from './logger'

let logErrorWithDefault: LogMethod
if (config.get('logger.exception')) {
  logErrorWithDefault = getLogger('Exception').error
}

export abstract class CustomError extends Error {
  constructor (message?: string, logErrorWith?: LeveledLogMethod | boolean) {
    super(message)
    this.name = this.constructor.name
    if (logErrorWith) {
      logErrorWith === true
        ? logErrorWithDefault(message)
        : logErrorWith(message)
    }
  }
}

export class InvalidArgumentError extends CustomError {}

export class NotFoundError extends CustomError {
  constructor (id: string | number, type?: string, logErrorWith?: LogMethod) {
    super(`"${id}" ${type ? `is an unknown ${type}` : 'not found'}`, logErrorWith)
  }
}
