import { isWorldMap } from '@engine/map/guards'
import { validate } from '@shared/validator'
import WorldMap from '../WorldMap'

abstract class MapRenderer {
  protected map: WorldMap = new WorldMap(1, 1)

  constructor (map?: WorldMap) {
    this.setMap(map)
  }

  render (map?: WorldMap): unknown {
    this.setMap(map)
    validate(this.map, isWorldMap, 'A `WorldMap` is required to be rendered')

    return this.renderer()
  }

  protected abstract renderer (): unknown

  private setMap (map?: WorldMap): void {
    if (map) {
      this.map = map
    }
  }
}

export default MapRenderer
