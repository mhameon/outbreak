import { Size, Coords, Tile, Tiles, Index, Tileset, Around, Square } from '../types'
import { OutOfMapError } from './WorldMapErrors'
import { isCoordsArray, isCoords } from './guards'
import { Seeder } from '@engine/map/builder/MapBuilder'
import { InvalidArgumentError } from '@shared/Errors'
import { getSanitizedTileset } from '@engine/map/tilerules'

/**
 * A 2D map describing the game board.
 */
class WorldMap {
  static readonly emptyTileset: Tileset = new Set<Tile>([ Tile.Grass ])
  readonly size: Size
  readonly seeder?: Seeder
  readonly name: string
  private tiles: Map<Index, Tileset>

  constructor (size: Size, seeder?: Seeder) {
    this.tiles = new Map()
    this.size = size
    this.seeder = seeder
    this.name = 'Unnamed map'
  }

  add (tiles: Tiles | Tileset, at: Coords | Array<Coords>): void {
    let point!: Coords
    if (isCoordsArray(at)) {
      point = at.pop() as Coords
      if (isCoordsArray(at)) {
        this.add(tiles, at)
      }
    } else if (isCoords(at)) {
      point = at
    }

    if (this.contains(point)) {
      const index = WorldMap.index(point)
      const tileset = getSanitizedTileset(tiles)

      const existing = this.tiles.get(index)
      if (existing){
        const toAdd = getSanitizedTileset([ ...existing, ...tileset ], true)
        if (toAdd.size){
          this.tiles.set(index, toAdd)
        }
      } else {
        this.tiles.set(index, tileset)
      }
    }
  }

  set (tiles: Tiles | Tileset, at: Coords | Array<Coords>): void {
    let point!: Coords
    if (isCoordsArray(at)) {
      point = at.pop() as Coords
      if (isCoordsArray(at)) {
        this.set(tiles, at)
      }
    } else if (isCoords(at)) {
      point = at
    }

    const tileset = getSanitizedTileset(tiles, true)
    const index = WorldMap.index(point)
    this.tiles.delete(index)
    if (tileset.size >= 1 && !(tileset.size === 1 && tileset.has(Tile.Walkable))) {
      this.tiles.set(index, tileset)
    }
  }

  get (at: Coords): Tileset {
    this.assertMapContains(at)
    return this.tiles.get(WorldMap.index(at)) ?? WorldMap.emptyTileset
  }

  getAround (at: Coords): Around {
    const around: Around = new Map()
    const from = { x: at.x - 1, y: at.y - 1 }
    const to = { x: at.x + 1, y: at.y + 1 }
    let direction = 0
    for (let y = from.y; y <= to.y; y++) {
      for (let x = from.x; x <= to.x; x++) {
        if (x !== at.x || y !== at.y) {
          try {
            around.set(direction, this.get({ x, y }))
          } catch (e) {
            // Do nothing
          }
          direction++
        }
      }
    }
    return around
  }

  extract (center: Coords, surface: Size): WorldMap {
    this.assertMapContains(center)
    if ((surface.width - 1) % 2 !== 0 || (surface.height - 1) % 2 !== 0) {
      throw new InvalidArgumentError('Expected Surface dimensions must be odd')
    }

    const offsetX = (surface.width - 1) / 2
    const offsetY = (surface.height - 1) / 2
    const topLeft = {
      x: center.x - offsetX < 0 ? 0 : center.x - offsetX,
      y: center.y - offsetY < 0 ? 0 : center.y - offsetY
    }
    const bottomRight = {
      x: center.x + offsetX > this.size.width - 1 ? this.size.width - 1 : center.x + offsetX,
      y: center.y + offsetY > this.size.height - 1 ? this.size.height - 1 : center.y + offsetY
    }

    const region = new WorldMap({ width: 1 + bottomRight.x - topLeft.x, height: 1 + bottomRight.y - topLeft.y })
    const destination: Coords = { x: 0, y: 0 }
    for (let y = topLeft.y; y <= bottomRight.y; y++) {
      destination.x = 0
      for (let x = topLeft.x; x <= bottomRight.x; x++) {
        region.set([ ...this.get({ x, y }) ], destination)
        ++destination.x
      }
      ++destination.y
    }
    return region
  }

  each (callback: (square: Square) => void): void {
    this.tiles.forEach(
      (tileset, index) => callback({ coords: WorldMap.coords(index), tileset }),
    )
  }

  has (tiles: Tiles, at: Coords): boolean {
    const tileset = this.get(at)
    return ([] as Tile[]).concat(tiles).every(tile => tileset.has(tile))
  }

  isWalkable (at: Coords): boolean {
    this.assertMapContains(at)
    return !this.has(Tile.Block, at)
  }

  contains (point: Coords): boolean {
    return point.x >= 0 && point.x < this.size.width && point.y >= 0 && point.y < this.size.height
  }

  private assertMapContains (at: Coords): void {
    if (!this.contains(at)) {
      throw new OutOfMapError(at, this.size)
    }
  }

  private static index (at: Coords): Index {
    return `${at.x},${at.y}`
  }

  private static coords (index: Index): Coords {
    const [ x, y ] = index.split(',')
    return { x: Number(x), y: Number(y) }
  }
}

export default WorldMap
