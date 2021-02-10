import { CustomError } from '@shared/Errors'
import { LogMethod } from '@shared/logger'
import { Coords, Size } from '../types'

export class OutOfMapError extends CustomError {
  constructor (at: Coords, size: Size, logErrorWith?: LogMethod) {
    super(`Coords ${at.x},${at.y} is outside map (${size.width}x${size.height})`, logErrorWith)
  }
}
