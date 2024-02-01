import type { Size } from '#shared/types'
import * as THREE from 'three'
import { Core } from '../engine/Core'
import type { Destroyable } from '../engine/interface/Destroyable'
import { disposeRecursively } from '../engine/utils/dispose'
import { BLOCK_SIZE } from '../World'

export class Ground extends Core implements Destroyable {
  readonly mesh: THREE.Mesh

  constructor (size: Size) {
    super()

    const width = size.width * BLOCK_SIZE
    const height = size.height * BLOCK_SIZE
    const groundGeometry = new THREE.PlaneGeometry(width, height)

    //todo manage materials globally
    const groundMaterial = new THREE.MeshBasicMaterial({
      color: '#23860a',
    })
    groundMaterial.needsUpdate = false

    this.mesh = new THREE.Mesh(groundGeometry, groundMaterial)
    this.mesh.position.set(width * .5, 0, height * .5)
    this.mesh.rotation.x = -Math.PI * .5

    const helper = new THREE.AxesHelper(10 * BLOCK_SIZE)
    helper.position.y = 0.01
    this.mesh.add(helper)
  }

  destroy () {
    disposeRecursively(this.mesh)
  }
}
