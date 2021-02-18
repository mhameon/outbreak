import { Seed, Size } from '../../types'
import WorldMap from '../WorldMap'

export type Seeder = { builder: string; seed: Seed }

abstract class MapBuilder {
  protected map!: WorldMap
  protected seed: Seed = -1
  protected size:Size

  constructor (size:Size) {
    this.size = size
  }

  getSeeder (): Seeder {
    return { builder: this.constructor.name, seed: this.seed }
  }

  generate (seed: Seed): WorldMap {
    this.seed = seed

    this.map = new WorldMap(this.size, this.getSeeder())

    return this.build()
  }

  protected abstract build (): WorldMap
}

export default MapBuilder
