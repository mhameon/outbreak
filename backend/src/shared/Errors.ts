import config from 'config'
import { getLogger, Logger, LogMethod } from './logger'

let unlabeled: Logger
if (config.get('logger.exception')) {
  unlabeled = getLogger('Exception')
}

export abstract class CustomError extends Error {
  constructor (message?: string, logErrorWith = unlabeled?.error) {
    super(message)
    this.name = this.constructor.name
    if (logErrorWith) {
      logErrorWith(message)
    }
  }
}

export class InvalidArgumentError extends CustomError {
  // constructor (name: string, logErrorWith?: LogMethod) {
  //   super(`Invalid argument ${name}`, logErrorWith)
  // }
}

export class NotFoundError extends CustomError {
  constructor (id: string | number, type?: string, logErrorWith?: LogMethod) {
    super(`"${id}" ${type ? `is an unknown ${type}` : 'not found'}`, logErrorWith)
  }
}
