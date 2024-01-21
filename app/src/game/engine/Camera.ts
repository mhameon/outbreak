import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import type { Animate, Clock } from './interface/Animate'
import type { Resizable } from './interface/Resizable'
import { App, Engine } from './Engine'

type Position = { x: number, y: number, z: number }

export class Camera implements Resizable, Animate {
  readonly instance: THREE.PerspectiveCamera
  readonly controls: OrbitControls

  constructor (at: Position) {
    this.instance = this.#createCamera(at)
    this.controls = this.#createControls()
  }

  #createCamera ({ x, y, z }: Position): THREE.PerspectiveCamera {
    const instance = new THREE.PerspectiveCamera(
      35,
      App().display.aspectRatio,
      .1,
      100
    )
    instance.position.set(x, y, z)
    App().scene.add(instance)

    return instance
  }

  #createControls (): OrbitControls {
    const controls = new OrbitControls(this.instance, App().canvas)
    controls.enableDamping = true

    controls.listenToKeyEvents(window)
    controls.keyPanSpeed = 70

    controls.zoomSpeed = 20

    controls.minPolarAngle = 0 // top-down view
    controls.maxPolarAngle = Math.PI * .49 // almost horizon

    return controls
  }

  resize () {
    this.instance.aspect = App().display.aspectRatio
    this.instance.updateProjectionMatrix()
  }

  animate (clock: Clock) {
    this.controls.update(clock.getDelta())
  }

  destroy () {
    this.controls.dispose()
  }
}
