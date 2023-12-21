import { Direction, DirectionClockwise, DirectionInDegree } from '#engine/types'
import { InvalidArgumentError } from '#common/Errors'

/**
 * Convert a "clockwise index" to a `Direction`
 * @see Direction
 */
export function toDirection (clockwiseIndex: number): Direction {
  if (clockwiseIndex < 0 && clockwiseIndex > 7) {
    throw new InvalidArgumentError('clockwiseIndex must be a number in [0, 7]')
  }
  return DirectionClockwise[clockwiseIndex]
}

/**
 * Convert a `Direction` to his value in degrees
 * @see Direction
 */
export function toDegrees (facing: Direction): number {
  return DirectionInDegree[facing]
}
