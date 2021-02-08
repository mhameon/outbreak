import { CustomError } from '@shared/CustomError'
import { LogMethod } from '@shared/logger'
import { Coords, Size } from '../type/outbreak'

export class InvalidArgumentError extends CustomError {
}

export class NotFoundError extends CustomError {
  constructor (id: string|number, type?: string, logErrorWith?: LogMethod) {
    super(`"${id}" ${type ? `is an unknown ${type}` : 'not found'}`, logErrorWith)
  }
}

export class OutOfMapError extends CustomError {
  constructor (at: Coords, size: Size, logErrorWith?: LogMethod) {
    super(`Coords ${at.x},${at.y} is outside map (${size.width}x${size.height})`, logErrorWith)
  }
}
