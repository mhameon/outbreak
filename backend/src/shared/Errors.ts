import config from 'config'
import { LeveledLogMethod } from 'winston'
import { getLogger, Logger, LogMethod } from './logger'

let generic: Logger
if (config.get('logger.exception')) {
  generic = getLogger('Exception')
}

export abstract class CustomError extends Error {
  constructor (message?: string, logErrorWith: LeveledLogMethod | boolean = generic?.error) {
    super(message)
    this.name = this.constructor.name
    if (logErrorWith !== false) {
      logErrorWith === true
        ? generic?.error(message)
        : logErrorWith(message)
    }
  }
}

export class InvalidArgumentError extends CustomError {
  constructor (name: string, logErrorWith?: LogMethod) {
    super(`Invalid argument ${name}`, logErrorWith)
  }
}

export class NotFoundError extends CustomError {
  constructor (id: string | number, type?: string, logErrorWith?: LogMethod) {
    super(`"${id}" ${type ? `is an unknown ${type}` : 'not found'}`, logErrorWith)
  }
}
