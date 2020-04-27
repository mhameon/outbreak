import { Coords, Size } from '../@types/outbreak'

export class OutOfMapError extends Error {
  constructor (at: Coords, size: Size) {
    super(`Coords ${at.x},${at.y} are outside map (${size.width}x${size.height})`)
  }
}
