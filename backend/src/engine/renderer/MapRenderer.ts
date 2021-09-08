import { isWorldMap } from '@engine/guards'
import { validate } from '@shared/validator'
import { WorldMap } from '../map/WorldMap'

abstract class MapRenderer {
  protected map!: WorldMap

  constructor (map?: WorldMap) {
    this.setMap(map)
  }

  render (map?: WorldMap): string {
    this.setMap(map)
    validate(this.map, isWorldMap, 'A `WorldMap` is required to be rendered')

    return this.renderer()
  }

  protected abstract renderer (): string

  private setMap (map?: WorldMap): void {
    if (map) {
      this.map = map
    }
  }
}

export default MapRenderer
