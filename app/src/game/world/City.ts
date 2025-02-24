import type { Coords } from '#shared/types'

import type { GameId, Size } from '#shared/types'
import * as THREE from 'three'
import { Core } from '../engine/Core'
import { BLOCK_SIZE } from '../World'
import { Ground } from './Ground'

type SerializedMap = Array<[ string, Array<number> ]>

export class City extends Core {
  city: THREE.Group

  #ground?: Ground

  static building = {
    geometry: new THREE.BoxGeometry(1, 1, 1),
    material: new THREE.MeshLambertMaterial({
      color: '#666666',
    })
  }

  constructor () {
    super()
    this.city = new THREE.Group()
    City.building.material.needsUpdate = false
  }

  setMap ({ id, turn, size, map }: { id: GameId, turn: number, size: Size, map: SerializedMap }) {
    this.#ground = new Ground(size) // todo singleton
    this.city.add(this.#ground?.mesh)

    map.forEach(([ index, tileset ]) => {
      console.log(index, tileset)
      const [ x, y ] = index.split(',')
      const tile = this.getTile({ x: +x, y: +y }, tileset)
      if (tile) {
        this.city.add(tile)
      }
    })

    this.city.position.set(-size.width * .5, 0, -size.height * .5)
    this.scene.add(this.city)
  }

  // fixme use Coords
  getTile ({ x, y }: Coords, tiles: Array<number>): THREE.Mesh | null {
    if (tiles.includes(104)) { //Building


      let height = 1
      if (tiles.includes(12)) height = 1
      if (tiles.includes(13)) height = 2
      if (tiles.includes(14)) height = 3
      if (tiles.includes(15)) height = 4
      if (tiles.includes(16)) height = 5

      height *= BLOCK_SIZE / 2

      const mesh = new THREE.Mesh(City.building.geometry, City.building.material)
      mesh.name = `${x},${y}`
      mesh.scale.set(BLOCK_SIZE - 4, height, BLOCK_SIZE - 4)
      mesh.position.set(
        x * BLOCK_SIZE + BLOCK_SIZE * .5 + 2,
        height * .5,
        y * BLOCK_SIZE + BLOCK_SIZE * .5 + 2
      )

      return mesh
    }

    return null
  }

  destroy () {
    this.#ground = undefined
  }
}
