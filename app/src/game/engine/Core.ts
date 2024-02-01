import * as THREE from 'three'
import { Camera } from './Camera'
import { Debug } from './Debug'
import { Display } from './Display'
import { Engine } from './Engine'
import { Renderer } from './Renderer'

/**
 * Engine Core components
 */
export interface CoreComponents {
  canvas: HTMLCanvasElement
  clock: THREE.Clock
  scene: THREE.Scene
  display: Display
  camera: Camera
  renderer: Renderer
  debug: Debug
}

/**
 * Utility class that allow you to easily access to all useful Engine properties
 * @note Engine MUST be instantiated first, or you'll get an Error "missing `canvas` parameter"
 */
export abstract class Core implements CoreComponents {
  #engine = Engine.getInstance()

  readonly camera = this.#engine.camera
  readonly canvas = this.#engine.canvas
  readonly clock = this.#engine.clock
  readonly debug = this.#engine.debug
  readonly display = this.#engine.display
  readonly renderer = this.#engine.renderer
  readonly scene = this.#engine.scene
}
