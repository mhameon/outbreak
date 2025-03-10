import { CustomError } from '#common/Errors'
import type { LogMethod } from '#common/logger'

export class ConnectionRefusedError extends CustomError {
  constructor (reason: string, logErrorWith?: LogMethod) {
    super(`Connection refused: ${reason}`, logErrorWith)
  }
}
