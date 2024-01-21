import * as THREE from 'three'
import { Engine } from './Engine'

/**
 * Wrap a `THREE.WebGLRenderer`, handle resizing and animation loop
 * @see THREE.WebGLRenderer
 */
export class Renderer {
  readonly instance: THREE.WebGLRenderer

  readonly #engine = Engine.getInstance()
  readonly #canvas = this.#engine.canvas
  readonly #stats = this.#engine.debug.stats
  readonly #display = this.#engine.display
  readonly #scene = this.#engine.scene
  readonly #camera = this.#engine.camera.instance

  constructor () {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.#canvas,
      antialias: true
    })
    this.configure()
    this.resize()

    this.instance.setAnimationLoop(() => {
      this.#stats?.begin()

      this.#engine.animate()
      this.instance.render(this.#scene, this.#camera)

      this.#stats?.end()
    })
  }

  configure () {
    this.instance.setClearColor('#211d20')
    this.instance.outputColorSpace = THREE.SRGBColorSpace
    this.instance.shadowMap.enabled = true
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap
  }

  resize () {
    this.instance.setSize(this.#display.width, this.#display.height)
    this.instance.setPixelRatio(this.#display.pixelRatio)
  }

  destroy () {
    this.instance.dispose()
  }
}
