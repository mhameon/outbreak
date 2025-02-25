import { Seed } from '#engine/types'
import { WorldMap } from '../WorldMap'
import { getLogger } from '#common/logger'
import { EntityManager } from '#engine/outbreak/entities/EntityManager'
import { Size } from '#shared/types'

export type Seeder = { builder: string; seed: Seed }

const log = getLogger('MapBuilder')

abstract class MapBuilder {
  protected map: WorldMap
  protected seed: Seed
  protected size: Size

  constructor (seed: Seed, size: Size) {
    this.seed = seed
    this.size = size
    this.map = new WorldMap(this.size, this.getSeeder())
  }

  getSeeder (): Seeder {
    return { builder: this.constructor.name, seed: this.seed }
  }

  getMapRef (): WorldMap {
    return this.map
  }

  generate (): WorldMap {
    log.profile('generate')
    const { seed, builder } = this.getSeeder()
    this.map = this.build()
    log.profile('generate', { message: 'Generating...', level: 'debug', builder, seed })

    return this.map
  }

  protected abstract build (): WorldMap

  abstract populate (entity: EntityManager, map: WorldMap): void
}

export default MapBuilder
