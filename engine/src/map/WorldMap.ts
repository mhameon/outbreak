import { Size, Coords, Tile } from '../@types/outbreak'
import { OutOfMapError } from './MapErrors'

type Index = string
type Tileset = Set<Tile>

class WorldMap {
  private static emptyTileset = new Set([ Tile.Walkable ])

  public readonly size: Size
  public readonly name: string
  private tiles: Map<Index, Tileset>

  constructor (width: number, height: number) {
    this.tiles = new Map()
    this.size = { width, height }
    this.name = 'Random Name' // Todo build map name generator (related to map theme)
  }

  private static index (at: Coords): Index {
    return `${at.x},${at.y}`
  }

  isInside (at: Coords): boolean {
    return at.x >= 0 && at.x < this.size.width && at.y >= 0 && at.y < this.size.height
  }

  add (tile: Tile, at: Coords): void {
    this.assertIsInside(at)
    const index = WorldMap.index(at)
    if (this.tiles.has(index)) {
      if (tile === Tile.Walkable && this.has(Tile.Block, at)) {
        const tiles = (this.get(at) as Tileset)
        tiles.delete(Tile.Block)
        this.tiles.set(index, tiles)
      } else {
        this.tiles.set(index, (this.get(at) as Tileset).add(tile))
      }
    } else {
      if (tile !== Tile.Walkable) {
        this.tiles.set(index, new Set([ tile ]))
      }
    }
  }

  get (at: Coords): Tileset {
    this.assertIsInside(at)
    return this.tiles.get(WorldMap.index(at)) ?? WorldMap.emptyTileset
  }

  has (tile: Tile | Tile[], at: Coords): boolean {
    this.assertIsInside(at)
    const search = ([] as Tile[]).concat(tile)
    const tiles = this.get(at)

    return search.every(t => tiles.has(t))
  }

  isWalkable (at: Coords): boolean {
    this.assertIsInside(at)
    return !this.has(Tile.Block, at)
  }

  private assertIsInside (at: Coords): void {
    if (!this.isInside(at)) {
      throw new OutOfMapError(at, this.size)
    }
  }
}

export default WorldMap
