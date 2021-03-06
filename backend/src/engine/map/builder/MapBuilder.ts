import { Seed, Size } from '@engine/types'
import WorldMap from '../WorldMap'
import { getLogger } from '@shared/logger'

export type Seeder = { builder: string; seed: Seed }

const log = getLogger('MapBuilder')

abstract class MapBuilder {
  protected map!: WorldMap
  protected seed: Seed = -1
  protected size: Size

  constructor (size: Size) {
    this.size = size
  }

  getSeeder (): Seeder {
    return { builder: this.constructor.name, seed: this.seed }
  }

  generate (seed: Seed): WorldMap {
    this.seed = seed
    const seeder = this.getSeeder()

    this.map = new WorldMap(this.size, seeder)

    log.profile('generate')
    const world = this.build()
    log.profile('generate', { message: 'Generating...', level: 'debug', seed: seeder.seed, builder: seeder.builder })

    return world
  }

  protected abstract build (): WorldMap
}

export default MapBuilder
