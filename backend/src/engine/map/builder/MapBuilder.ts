import { Seed } from '../../type/outbreak'
import WorldMap from '../WorldMap'

export type Seeder = {
  builder: string
  seed: Seed
}

abstract class MapBuilder {
  protected map: WorldMap
  protected seed?: Seed

  constructor (width: number, height: number) {
    this.map = new WorldMap(width, height)
  }

  getSeeder (): Seeder{
    return { builder: this.constructor.name, seed: this.seed || '' }
  }

  abstract generate (seed?:Seed): WorldMap
}

export default MapBuilder
