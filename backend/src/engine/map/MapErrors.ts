import { CustomError } from '@shared/Errors'
import { Coords, Size } from '../types'

export class OutOfMapError extends CustomError {
  constructor (at: Coords, size: Size) {
    super(`Coords ${at.x},${at.y} is outside map (${size.width}x${size.height})`, false)
  }
}
