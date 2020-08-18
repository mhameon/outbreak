import Outbreak from './Outbreak'
import CityMapBuilder from '../map/builder/city/CityMapBuilder'
import { GameId } from '../@types/outbreak'

class OutbreakFactory {
  // Todo OutbreakFactory.create will take options (map theme, size range: small, medium, big, max players?...
  create (id: GameId, options = {}): Outbreak {
    const map = (new CityMapBuilder(60, 25)).generate()
    return new Outbreak(id, map)
  }
}

export default new OutbreakFactory()
