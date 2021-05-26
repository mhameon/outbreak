import { Outbreak } from './Outbreak'
import { CityMapBuilder } from '../map/builder/city/CityMapBuilder'
import { GameId, Seed } from '../types'
import { Options } from '@engine/outbreak'


// Todo OutbreakFactory.create will take options (map theme, size range: small, medium, big, max players?...
const defaultOptions: Options = {
  size: { width: 160, height: 30 },
  wind: { angle: 90, force: 5 }
}

export class OutbreakFactory {
  static create (id: GameId, options: Options = defaultOptions): Outbreak {
    const mapBuilder = new CityMapBuilder(id as Seed, options.size)
    const outbreak = new Outbreak(id, mapBuilder.getMapRef(), defaultOptions)
    mapBuilder.generate()
    return outbreak
  }
}
