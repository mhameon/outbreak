import Outbreak from './Outbreak'
import CityMapBuilder from '../map/builder/city/CityMapBuilder'
import { GameId } from '../type/outbreak'


type Options = {

}

class OutbreakFactory {
  // Todo OutbreakFactory.create will take options (map theme, size range: small, medium, big, max players?...
  create (id: GameId, options:Partial<Options> = {}): Outbreak {
    const map = (new CityMapBuilder(60, 25)).generate(id)
    return new Outbreak(id, map)
  }
}

export default new OutbreakFactory()
