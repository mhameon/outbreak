import { Coords, Size } from '../@types/outbreak'

abstract class CustomError extends Error {
  constructor (message?: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class InvalidArgumentError extends CustomError {
}

export class OutOfMapError extends CustomError {
  constructor (at: Coords, size: Size) {
    super(`Coords ${at.x},${at.y} is outside map (${size.width}x${size.height})`)
  }
}
