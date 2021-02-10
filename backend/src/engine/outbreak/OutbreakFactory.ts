import { Outbreak } from './Outbreak'
import { CityMapBuilder2 } from '../map/builder/city/CityMapBuilder2'
import { GameId, Size } from '../type/outbreak'

type Options = {
  size: Size
}

export class OutbreakFactory {
  // Todo OutbreakFactory.create will take options (map theme, size range: small, medium, big, max players?...
  static create (id: GameId, options: Partial<Options> = {}): Outbreak {
    const map = (new CityMapBuilder2(60, 25)).generate(id)
    return new Outbreak(id, map)
  }
}
