import { Outbreak } from './Outbreak'
import { CityMapBuilder } from '../map/builder/city/CityMapBuilder'
import { GameId, Size } from '../types'

type Options = {
  size: Size
}

// Todo OutbreakFactory.create will take options (map theme, size range: small, medium, big, max players?...
const defaultOptions: Options = {
  size: { width: 60, height: 25 }
}

export class OutbreakFactory {
  static create (id: GameId, options: Options = defaultOptions): Outbreak {
    const mapBuilder = new CityMapBuilder(id, options.size)
    const outbreak = new Outbreak(id, mapBuilder.getMapRef())
    mapBuilder.generate()
    return outbreak
  }
}
