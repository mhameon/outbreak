import { type Animate, type Clock, implementsAnimate } from './interface/Animate'

/**
 * Base class representing the 3D World handled by the Engine.
 * Must be inherited and added to the world with `Engine.build()`
 *
 * @see Engine.build()
 */
export abstract class World implements Animate {
  animatedAttributes: Array<Animate> = []

  /**
   * Register all attributes that implements `Animate` interface
   */
  registerAnimations () {
    this.animatedAttributes = Object.getOwnPropertyNames(this).reduce<Animate[]>((animates, property) => {
      const instance = (this as any)[property]
      if (implementsAnimate(instance)) {
        animates.push(instance)
      }
      return animates
    }, [])
  }

  /**
   * If you need an event listener, just override the `onEvent` method.
   *
   * In your own `World` (inheriting of abstract World base class):
   * @example
   *  onEvent (event: CustomEvent | MouseEvent) {
   *    // Do something regarding type of event
   *  }
   *
   * `onEvent()` can be triggered by using you own CustomEvent:
   * @example
   *   document.addEventListener('myCustomEventType', App().world.onEvent)
   *   ...
   *   document.dispatchEvent(new CustomEvent('myCustomEventType', { detail }))
   *
   * Or via a classic DOM or React event:
   * @example
   *   <canvas onMouseMove={ (e) => App().world.onEvent(e) } />
   */
  onEvent (event: any) {
  }

  animate (clock: Clock) {
    for (const animatable of this.animatedAttributes) {
      animatable.animate(clock)
    }
  }

  abstract destroy (): void
}
