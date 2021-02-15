import { Seed } from '../../types'
import WorldMap from '../WorldMap'

type Seeder = { builder: string; seed: Seed }

abstract class MapBuilder {
  protected map: WorldMap
  protected seed: Seed = -1

  constructor (width: number, height: number) {
    this.map = new WorldMap(width, height)
  }

  getSeeder (): Seeder {
    return { builder: this.constructor.name, seed: this.seed }
  }

  generate (seed: Seed): WorldMap {
    this.seed = seed
    return this.build()
  }

  protected abstract build (): WorldMap
}

export default MapBuilder
