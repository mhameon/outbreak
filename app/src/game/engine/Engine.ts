import * as THREE from 'three'
import { Camera } from './Camera'
import { Debug } from './Debug'
import type { Animate } from './interface/Animate'
import { Renderer } from './Renderer'
import { Display } from './Display'
import { World } from './world/World'

export class Engine implements Animate {
  static #instance: Engine | null

  readonly canvas: HTMLCanvasElement

  readonly clock = new THREE.Clock(false)
  readonly scene = new THREE.Scene()
  readonly display: Display
  readonly camera: Camera
  readonly renderer: Renderer
  readonly debug = new Debug()

  #world?: World

  /**
   * Get the  Engine instance (or create it when `canvas` is provided for the first time)
   */
  static getInstance (canvas?: HTMLCanvasElement): Engine {
    if (!Engine.#instance) {
      if (!canvas) {
        throw new Error('missing `canvas` parameter')
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
    // `Engine.#instance` assignation has to be done here too. Otherwise, objects created in the constructor
    // and using `Engine.getInstance()` (like Display, Camera, Renderer...) can't access it.
    Engine.#instance = this

    this.canvas = canvas

    // this.resources = new Resources(sources)
    this.display = new Display()
    this.camera = new Camera({ x: 0, y: 20, z: 30 })
    this.renderer = new Renderer()

    this.display.addEventListener('onResize', this.onResize.bind(this))

    if (this.debug.enabled) {
      window.engine = this
    }
  }

  build (world: World): Engine {
    this.#world = world
    return this
  }

  get world (): World {
    if (!this.#world) {
      throw new Error('you have to `build(new World)` first')
    }
    return this.#world
  }

  onResize () {
    this.camera.resize()
    this.renderer.resize()
  }

  animate () {
    this.camera.animate(this.clock)
    this.world?.animate(this.clock)
  }

  destroy () {
    this.display.removeEventListener('onResize', this.onResize.bind(this))

    this.scene.traverse(child => {
      // noinspection SuspiciousTypeOfGuard
      if (child instanceof THREE.Mesh) {
        for (const attr in child.material) {
          const value = child.material[attr]
          if (value?.dispose instanceof Function) {
            value.dispose()
          }
        }
        child.material.dispose()
        child.geometry.dispose()
      }

      if ((child as any)?.dispose instanceof Function) {
        (child as any).dispose()
      }
    })

    // todo cleanup textures
    // for(const texture in this.resources.items){
    //   if(this.resources.items[texture]?.dispose instanceof Function){
    //     console.log(texture)
    //     this.resources.items[texture].dispose()
    //   }
    // }

    this.camera.destroy()
    this.renderer.destroy()
    this.display.destroy()
    this.debug.destroy()
    this.#world?.destroy()

    window.engine = null
    Engine.#instance = null

    const { memory, programs } = this.renderer.instance.info
    if (memory.geometries > 0 || memory.textures > 0 || programs?.length) {
      console.warn('Bad memory cleanup!', this.renderer.instance.info)
    }
  }
}

/**
 * Facade for `Engine.getInstance()`
 * @see Engine.getInstance
 */
export const App = (...args: Parameters<typeof Engine.getInstance>) => Engine.getInstance(...args)
