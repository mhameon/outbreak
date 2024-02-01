import * as THREE from 'three'
import { AnimationControls } from './AnimationControls'
import { Camera } from './Camera'
import type { CoreComponents } from './Core'
import { Debug } from './Debug'
import { type Animate } from './interface/Animate'
import { type Destroyable, implementsDestroyable } from './interface/Destroyable'
import { Renderer } from './Renderer'
import { Display } from './Display'
import { disposeRecursively } from './utils/dispose'
import { deleteAttributes, forEachPropertyOf } from './utils/object'
import { World } from './World'

/**
 * Root class that manage Three.js application
 *
 * @todo
 *  - Loaders (textures & models)
 *  - workers?
 */
export class Engine implements CoreComponents, Animate, Destroyable {
  static #instance: Engine | null

  readonly canvas: HTMLCanvasElement
  readonly clock = new THREE.Clock(false)
  readonly scene = new THREE.Scene()
  readonly display: Display
  readonly camera: Camera
  readonly renderer: Renderer
  readonly debug = new Debug()

  #world?: World
  #animation?: AnimationControls

  #resizeHandler = this.onResize.bind(this)

  /**
   * Get the `Engine` instance
   * @throws {Error} when the instance doesn't exist (call it with `canvas` parameter first)
   */
  static getInstance (canvas?: HTMLCanvasElement): Engine {
    if (!Engine.#instance) {
      if (!canvas) {
        throw new Error('can\'t access to an uninitialized instance of Engine')
      }
      Engine.#instance = new Engine(canvas)
    }
    return Engine.#instance
  }

  /**
   * Singleton
   * @see Engine.getInstance
   */
  private constructor (canvas: HTMLCanvasElement) {
    // `Engine.#instance` assignation has to be done here too. Otherwise, Core objects created in the constructor
    // and using `Engine.getInstance()` internally will throw.
    Engine.#instance = this

    this.canvas = canvas

    this.display = new Display()
    this.display.addEventListener('onResize', this.#resizeHandler)

    this.camera = new Camera({ x: 0, y: 20, z: 30 }) // todo do not do that here

    this.renderer = new Renderer()
    window.addEventListener('beforeunload', (e) => {
      console.log(e)
      //e.preventDefault()
      this.destroy()
    })
    if (this.debug.enabled) {
      window.engine = this
    }
  }

  build (world: World): Engine {
    this.#world = world
    this.#animation = new AnimationControls(this.#world)
    return this
  }

  get world (): World {
    if (!this.#world) {
      throw new Error('you have to `build(new World())` first')
    }
    return this.#world
  }

  get animations (): AnimationControls {
    if (!this.#animation) {
      throw new Error('you have to `build(new World())` first')
    }
    return this.#animation
  }

  onResize () {
    this.camera.resize()
    this.renderer.resize()
  }

  animate () {
    this.camera.animate(this.clock)
    this.#world?.animate(this.clock)
  }

  destroy () {
    this.display.removeEventListener('onResize', this.#resizeHandler)

    disposeRecursively(this.scene)
    const { memory, programs } = this.renderer.instance.info
    if (memory.geometries > 0 || memory.textures > 0 || programs?.length) {
      console.warn('Bad memory cleanup!', this.renderer.instance.info)
    }

    forEachPropertyOf(this, implementsDestroyable, call => call.destroy())
    this.#world?.destroy()
    deleteAttributes([ 'camera', 'canvas', 'clock', 'debug', 'display', 'renderer', 'scene' ], this)

    this.#world = undefined
    this.#animation = undefined

    window.engine = null
    Engine.#instance = null
  }
}

/**
 * Facade for `Engine.getInstance()`
 * @see Engine.getInstance
 */
export const App = (...args: Parameters<typeof Engine.getInstance>) => Engine.getInstance(...args)
