import type { Clock } from 'three'
import { isObject } from '../utils/object'

export type { Clock }

/**
 * Classes implementing `Animate` and added to the `World` will see their method `animate(clock: Clock)` called
 * at each tick of the animation loop.
 * @see World
 * @see Renderer
 */
export interface Animate {
  /**
   * Called for your on each frame
   * @see THREE.Renderer.setAnimationLoop
   */
  animate (clock: Clock): void
}

export const implementsAnimate = (o: unknown): o is Animate => isObject(o) && 'animate' in o
