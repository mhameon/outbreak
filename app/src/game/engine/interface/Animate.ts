import type { Clock } from 'three'
import { isObject } from '../utils'

export type { Clock }

/**
 * Classes implementing `Animate` and added to the `World` will see their method `animate(clock: Clock)` called
 * at each tick of the animation loop.
 * @see World
 * @see Renderer
 */
export interface Animate {
  animate: (clock: Clock) => void
}

export const implementsAnimate = (o: unknown): o is Animate => isObject(o) && 'animate' in o
