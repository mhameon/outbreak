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
    const map = (new CityMapBuilder(options.size)).generate(id)
    return new Outbreak(id, map)
  }
}
