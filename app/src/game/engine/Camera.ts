import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import type { Animate, Clock } from './interface/Animate'
import type { Destroyable } from './interface/Destroyable'
import type { Resizable } from './interface/Resizable'
import { Engine } from './Engine'

type Position = { x: number, y: number, z: number }

export class Camera implements Resizable, Animate, Destroyable {
  readonly #engine = Engine.getInstance()
  readonly #screen = this.#engine.display

  readonly instance: THREE.PerspectiveCamera
  readonly controls: OrbitControls

  constructor (at: Position) {
    this.instance = this.#createCamera(at)
    this.controls = this.#createControls()
  }

  #createCamera ({ x, y, z }: Position): THREE.PerspectiveCamera {
    const instance = new THREE.PerspectiveCamera(
      35,
      this.#screen.aspectRatio,
      .1,
      100
    )
    instance.position.set(x, y, z)
    instance.far = 100_000_000


    const helper = new THREE.CameraHelper(instance)

    this.#engine.scene.add(instance, helper)

    return instance
  }

  #createControls (): OrbitControls {
    //type OrbitControlsConfig = Partial<ClassProperties<OrbitControls>>
    const controls = new OrbitControls(this.instance, this.#engine.canvas)
    controls.enableDamping = true

    controls.listenToKeyEvents(window)
    controls.keyPanSpeed = 70

    controls.zoomSpeed = 20

    controls.minPolarAngle = 0 // top-down view
    controls.maxPolarAngle = Math.PI * .49 // almost horizon

    return controls
  }

  resize () {
    this.instance.aspect = this.#screen.aspectRatio
    this.instance.updateProjectionMatrix()
  }

  animate (clock: Clock) {
    this.controls.update(clock.getDelta())
  }

  destroy () {
    this.controls.dispose()
    this.instance.remove()

    delete (this as any).instance
    delete (this as any).controls
  }
}
