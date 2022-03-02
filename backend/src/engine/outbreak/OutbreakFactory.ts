import { Outbreak } from './Outbreak'
import { CityMapBuilder } from '../map/builder/city/CityMapBuilder'
import { GameId, Seed } from '../types'
import { OutbreakOptions } from '#engine/outbreak/index'

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
    mapBuilder.populate(outbreak.creature, outbreak.map)

    return outbreak
  }
}
