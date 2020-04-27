import WorldMap from '../WorldMap'

abstract class MapBuilder {
  protected map?: WorldMap

  public abstract getName(): string
  public abstract generate (width: number, height: number): WorldMap
}

export default MapBuilder
