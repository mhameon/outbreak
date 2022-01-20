import { isWorldMap } from '@engine/guards'
import { WorldMap } from '../map/WorldMap'
import { Outbreak } from '@engine/outbreak'

export interface Renderable{
  render (world: WorldMap | Outbreak): string
}

export abstract class MapRenderer implements Renderable{
  render (world: WorldMap | Outbreak): string {
    if (isWorldMap(world)) {
      return this.renderer(new Outbreak('StandAloneRendering', world))
    }

    return this.renderer(world)
  }

  protected abstract renderer (outbreak: Outbreak): string
}
