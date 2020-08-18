import WorldMap from '../WorldMap'
import chalk from 'chalk'
import { Tile } from '../../@types/outbreak'

abstract class MapBuilder {
  protected map: WorldMap

  constructor (width: number, height: number) {
    this.map = new WorldMap(width, height, this.getName())
  }

  public abstract getName (): string

  public abstract generate (): WorldMap
}

export default MapBuilder
