import config from 'config'
import { LeveledLogMethod } from 'winston'
import { getLogger, LogMethod } from './logger'

let logErrorWithDefaultLevel: LogMethod
if (config.get('logger.exception')) {
  logErrorWithDefaultLevel = getLogger('Exception').error
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

export class InvalidArgumentError extends CustomError {}

export class NotFoundError extends CustomError {
  constructor (id: string | number, type?: string, logErrorWith?: LogMethod) {
    super(`"${id}" ${type ? `is an unknown ${type}` : 'not found'}`, logErrorWith)
  }
}
