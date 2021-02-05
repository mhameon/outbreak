import { Coords, Size } from '../@types/outbreak'

abstract class CustomError extends Error {
  protected constructor (message?: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class InvalidArgumentError extends CustomError {
}

export class NotFoundError extends CustomError {
  constructor (id: any, type?: string) {
    super(`"${id}" ${type ? `is an unknown ${type}` : 'not found'}`)
  }
}

export class OutOfMapError extends CustomError {
  constructor (at: Coords, size: Size) {
    super(`Coords ${at.x},${at.y} is outside map (${size.width}x${size.height})`)
  }
}
