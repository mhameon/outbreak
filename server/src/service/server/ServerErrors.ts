import type { LogMethod } from '../logger'

abstract class CustomError extends Error {
  protected constructor (message?: string, log?: LogMethod) {
    super(message)
    this.name = this.constructor.name
    if (log) {
      log(message)
    }
  }
}

export class ConnectionRefusedError extends CustomError {
  constructor (reason: string, logErrorWith?: LogMethod) {
    super(`Connection refused: ${reason}`, logErrorWith)
  }
}
