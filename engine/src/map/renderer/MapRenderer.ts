import WorldMap from '../WorldMap'

abstract class MapRenderer {
  readonly map: WorldMap

  constructor (map: WorldMap) {
    this.map = map
  }

  abstract render (): any
}

export default MapRenderer
