import * as THREE from 'three'
import type { Animate, Clock } from '../engine/interface/Animate'
import { App } from '../engine/Engine'

export class Ground implements Animate {
  readonly mesh: THREE.Mesh

  constructor () {
    const groundGeometry = new THREE.PlaneGeometry(20, 20)
    const groundMaterial = new THREE.MeshBasicMaterial({ color: '#333333' })
    this.mesh = new THREE.Mesh(groundGeometry, groundMaterial)
    this.mesh.rotation.x = -Math.PI * .5
    this.mesh.rotation.y = 0

    const helper = new THREE.AxesHelper(5)
    helper.position.y = 0.01
    this.mesh.add(helper)

    App().scene.add(this.mesh)
  }

  animate (clock: Clock) {
    this.mesh.rotation.z = clock.elapsedTime * .5
  }
}
