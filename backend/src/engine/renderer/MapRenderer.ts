import { isWorldMap } from '#engine/guards'
import { WorldMap } from '../map/WorldMap'
import { Outbreak } from '#engine/outbreak/index'
import { GAME_ID_PREFIX } from '#engine/types'

export const STANDALONE_RENDER = `${GAME_ID_PREFIX}StandAloneRendering` as const

export interface Renderable {
  render (world: WorldMap | Outbreak): string
}

export abstract class MapRenderer implements Renderable {
  render (world: WorldMap | Outbreak): string {
    if (isWorldMap(world)) {
      return this.renderer(new Outbreak(STANDALONE_RENDER, world))
    }

    return this.renderer(world)
  }

  protected abstract renderer (outbreak: Outbreak): string
}
