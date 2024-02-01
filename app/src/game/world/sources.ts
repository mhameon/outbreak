import * as THREE from 'three'
import { Resource, type ResourceData } from '../engine/Resource'

export const resource = {
  building: {
    geometry: new THREE.BoxGeometry(1, 1, 1),
    material: new THREE.MeshLambertMaterial({
      color: '#666666',
    })
  }
}

export const data = [
  {
    name: 'environmentMapTexture',
    type: 'cubeTexture',
    path:
      [
        'textures/environmentMap/px.jpg',
        'textures/environmentMap/nx.jpg',
        'textures/environmentMap/py.jpg',
        'textures/environmentMap/ny.jpg',
        'textures/environmentMap/pz.jpg',
        'textures/environmentMap/nz.jpg'
      ]
  },
  {
    name: 'grassColorTexture',
    type: 'texture',
    path: 'textures/dirt/color.jpg'
  },
] as const

export type ResourceName = (typeof data)[number]['name']
const test = new Resource(data as ResourceData)
