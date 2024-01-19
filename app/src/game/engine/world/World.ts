import { type Animate, type Clock, implementsAnimate } from '../interface/Animate'
import { WorldAnimationController } from './WorldAnimationController'

/**
 * Base class representing the 3D World handled by the Engine.
 * Must be inherited and added to the world with `Engine.build()`
 *
 * @see Engine.build()
 */
export abstract class World implements Animate {
  readonly animations: WorldAnimationController
  animatedAttributes: Array<Animate> = []

  protected constructor () {
    this.animations = new WorldAnimationController(this)
  }

  registerAnimations () {
    this.animatedAttributes = Object.getOwnPropertyNames(this).reduce<Animate[]>((animates, property) => {
      const instance = (this as any)[property]
      if (implementsAnimate(instance)) {
        animates.push(instance)
      }
      return animates
    }, [])
  }

  animate (clock: Clock) {
    for (const animatable of this.animatedAttributes) {
      animatable.animate(clock)
    }
  }

  destroy () {
    this.animations.destroy()
  }
}
