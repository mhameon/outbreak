import { type Animate, type Clock, implementsAnimate } from './interface/Animate'
import { type Destroyable, implementsDestroyable } from './interface/Destroyable'
import { fetchPropertiesOf, forEachPropertyOf } from './utils/object'

/**
 * Base class representing the 3D World handled by the Engine.
 * Must be inherited and added to the world with `Engine.build()`
 *
 * @see Engine.build()
 */
export abstract class World implements Animate, Destroyable {
  animatedProperties: Array<Animate> = []

  /**
   * Register all attributes that implements `Animate` interface
   */
  registerAnimations () {
    this.animatedProperties = Array.from(fetchPropertiesOf(this, implementsAnimate))
  }

  /**
   * If your World requires an event listener, just override the `onEvent` method.
   *
   * In your own `World` (inheriting this abstract World class):
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
    for (const animatable of this.animatedProperties) {
      animatable.animate(clock)
    }
  }

  destroy () {
    forEachPropertyOf(this, implementsDestroyable, call => call.destroy())
    this.animatedProperties = []
  }
}
