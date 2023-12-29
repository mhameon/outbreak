import { Outbreak } from './Outbreak'
import { CityMapBuilder } from '../map/builder/city/CityMapBuilder'
import type { GameId } from '#shared/types'
import type { OutbreakOptions } from '#engine/outbreak/index'
import type { Seed } from '#engine/types'

// Todo OutbreakFactory.create will take options (map theme, size range: small, medium, big, max players?...
const defaultOptions: OutbreakOptions = {
  size: { width: 100, height: 20 },
  wind: { angle: 45, force: 6 }
}

export class OutbreakFactory {
  static create (id: GameId, options: OutbreakOptions = defaultOptions): Outbreak {
    const mapBuilder = new CityMapBuilder(id as Seed, options.size)
    const outbreak = new Outbreak(id, mapBuilder.getMapRef(), options)
    mapBuilder.generate()
    mapBuilder.populate(outbreak.entity, outbreak.map)

    return outbreak
  }
}
