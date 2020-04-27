import Outbreak from './Outbreak'
import CityMapBuilder from '../map/builder/city/CityMapBuilder'

class OutbreakFactory {
  // Todo OutbreakFactory.create will take options (map theme, size range: small, medium, big, max players?...
  create (options = {}): Outbreak {
    const map = (new CityMapBuilder()).generate(30, 10)
    return new Outbreak(map)
  }
}

export default new OutbreakFactory()
