import { CustomError } from '@shared/Errors'
import type { LogMethod } from '@shared/logger'

export class ConnectionRefusedError extends CustomError {
  constructor (reason: string, logErrorWith?: LogMethod) {
    super(`Connection refused: ${reason}`, logErrorWith)
  }
}
