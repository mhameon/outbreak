import * as THREE from 'three'
import { Engine } from './Engine'
import type { Destroyable } from './interface/Destroyable'

/**
 * Wrap a `THREE.WebGLRenderer`, handle resizing and animation loop
 * @see THREE.WebGLRenderer
 */
export class Renderer implements Destroyable {
  readonly instance: THREE.WebGLRenderer

  #engine = Engine.getInstance()
  #canvas = this.#engine.canvas
  #stats = this.#engine.debug.stats
  #display = this.#engine.display
  #scene = this.#engine.scene
  #camera = this.#engine.camera.instance

  constructor () {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.#canvas,
      antialias: true
    })
    this.resize()

    this.instance.setClearColor('#211d20')
    this.instance.outputColorSpace = THREE.SRGBColorSpace
    // this.instance.shadowMap.enabled = true
    // this.instance.shadowMap.type = THREE.PCFSoftShadowMap

    this.instance.setAnimationLoop(() => this.tick())
  }

  resize () {
    this.instance.setSize(this.#display.width, this.#display.height)
    this.instance.setPixelRatio(this.#display.pixelRatio)
  }

  tick () {
    this.#stats?.begin()
    //console.log(this.instance.info.render.frame)
    this.#engine.animate()

    // optimisation idea: update shadow map 1 frames / 2
    // renderer.shadowMap.autoUpdate = false // outside of render tick
    // renderer.shadowMap.needsUpdate = true

    this.instance.render(this.#scene, this.#camera)
    this.#stats?.end()
  }

  destroy () {
    this.instance.renderLists.dispose()
    this.instance.dispose()
  }
}
