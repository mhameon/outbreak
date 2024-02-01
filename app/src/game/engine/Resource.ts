import { EventDispatcher, Texture } from 'three'
import { type ResourceName } from '../world/sources'
import type { Destroyable } from './interface/Destroyable'


export type ResourceLoader = 'texture' | 'cubeTexture' | 'gltfModel'

export type ResourceData = Readonly<Array<{
  name: ResourceName
  type: ResourceLoader
  path: string | Array<string>
}>>

export interface ResourceEventMap {
  'ready': {}
}

export class Resource extends EventDispatcher<ResourceEventMap> implements Destroyable {
  readonly sources: ResourceData
  #data?: Record<ResourceName, Texture>
  #loaded = 0
  #toLoad = 0

  constructor (data: ResourceData) {
    super()
    this.sources = data
    this.#toLoad = this.sources.length
  }

  destroy (): void {
    if (this.#data) {
      for (const texture of Object.values(this.#data)) {
        texture.dispose()
      }
    }
  }
}
