import MapBuilder from '../MapBuilder'
import WorldMap from '../../WorldMap'
import { Tile } from '../../../@types/outbreak'

class CityMapBuilder extends MapBuilder {
  getName (): string {
    return 'Random City' // Todo build map name generator (related to map theme)
  }

  generate (width: number, height: number): WorldMap {
    this.map = new WorldMap(width, height, this.getName())

    this.map.add(Tile.Block, { x: 0, y: 0 })

    this.map.add(Tile.Block, { x: 3, y: 8 })
    this.map.add(Tile.Block, { x: 4, y: 7 })
    this.map.add(Tile.Block, { x: 5, y: 6 })
    this.map.add(Tile.Block, { x: 6, y: 5 })

    this.map.add(Tile.Block, { x: 7, y: 2 })
    this.map.add(Tile.Block, { x: 8, y: 2 })
    this.map.add(Tile.Block, { x: 9, y: 2 })

    this.map.add(Tile.Block, { x: 20, y: 5 })
    this.map.add(Tile.Block, { x: 21, y: 5 })
    this.map.add(Tile.Block, { x: 22, y: 5 })
    this.map.add(Tile.Block, { x: 21, y: 4 })
    this.map.add(Tile.Block, { x: 21, y: 6 })

    return this.map
  }
}

export default CityMapBuilder
