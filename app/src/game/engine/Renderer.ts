import * as THREE from 'three'
import { App } from './Engine'

export class Renderer {
  readonly instance: THREE.WebGLRenderer

  constructor () {
    this.instance = this.#setInstance()
  }

  #setInstance (): THREE.WebGLRenderer {
    const instance = new THREE.WebGLRenderer({
      canvas: App().canvas,
      antialias: true
    })

    instance.outputColorSpace = THREE.SRGBColorSpace
    instance.shadowMap.enabled = true
    instance.shadowMap.type = THREE.PCFSoftShadowMap

    instance.setClearColor('#211d20')
    instance.setSize(App().display.width, App().display.height)
    instance.setPixelRatio(App().display.pixelRatio)

    instance.setAnimationLoop(() => {
      App().debug.stats?.begin()

      App().animate()
      instance.render(App().scene, App().camera.instance)

      App().debug.stats?.end()
    })

    return instance
  }

  onResize () {
    this.instance.setSize(App().display.width, App().display.height)
    this.instance.setPixelRatio(App().display.pixelRatio)
  }

  destroy () {
    this.instance.dispose()
  }
}
