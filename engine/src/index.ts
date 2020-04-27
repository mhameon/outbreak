import CityMapBuilder from './map/builder/city/CityMapBuilder'
import Outbreak from './outbreak/Outbreak'

const map = (new CityMapBuilder()).generate(40, 10)
const outbreak = new Outbreak(map)

export {
  outbreak
}
