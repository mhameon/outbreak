import { Size, Coords, Tile, Index, Tileset, Around, Square } from '../types'
import { OutOfMapError } from './MapErrors'
import { isCoordsArray, isCoords } from './guards'

/**
 * A 2D map describing the game board.
 */
class WorldMap {
  private static emptyTileset = new Set([ Tile.Walkable ])
  public readonly size: Size
  public readonly name: string
  private tiles: Map<Index, Tileset>

  constructor (width: number, height: number, name = 'Unknown map') {
    this.tiles = new Map()
    this.size = { width, height }
    this.name = name
  }

  private static index (at: Coords): Index {
    return `${at.x},${at.y}`
  }

  private static coords (index: Index): Coords {
    const [ x, y ] = index.split(',')
    return { x: Number(x), y: Number(y) }
  }

  contains (point: Coords): boolean {
    return point.x >= 0 && point.x < this.size.width && point.y >= 0 && point.y < this.size.height
  }

  add (tile: Tile, at: Coords | Array<Coords>): void {
    let point
    if (isCoordsArray(at)) {
      point = at.pop() as Coords
      if (isCoordsArray(at)) {
        this.add(tile, at)
      }
    }
    else if (isCoords(at)) {
      point = at
    }
    else {
      return
    }

    if (this.contains(point)) {
      const index = WorldMap.index(point)
      if (this.tiles.has(index)) {
        const tiles = (this.get(point) as Tileset)
        if (tile === Tile.Walkable && tiles.has(Tile.Block)) {
          tiles.delete(Tile.Block)
          this.tiles.set(index, tiles)
        }
        else {
          this.tiles.set(index, tiles.add(tile))
        }
      }
      else {
        this.set(tile, point)
      }
    }
  }

  set (tile: Tile | Tile[], at: Coords | Array<Coords>): void {
    let point
    if (isCoordsArray(at)) {
      point = at.pop() as Coords
      if (isCoordsArray(at)) {
        this.set(tile, at)
      }
    }
    else if (isCoords(at)) {
      point = at
    }
    else {
      return
    }

    const index = WorldMap.index(point)
    this.tiles.delete(index)
    const tileset = new Set(([] as Tile[]).concat(tile))
    if (tileset.size >= 2 && tileset.has(Tile.Walkable) && tileset.has(Tile.Block)) {
      tileset.delete(Tile.Walkable)
      tileset.delete(Tile.Block)
    }
    if (tileset.size >= 1 && (tileset.size !== 1 || !tileset.has(Tile.Walkable))) {
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
          }
          catch (e) {
            // Do nothing
          }
          direction++
        }
      }
    }
    return around
  }

  each (callback: (square: Square) => void): void {
    this.tiles.forEach(
      (tileset, index) => callback({ coords: WorldMap.coords(index), tileset }),
    )
  }

  has (tile: Tile | Tile[], at: Coords): boolean {
    this.assertMapContains(at)
    const search = ([] as Tile[]).concat(tile)
    const tileset = this.get(at)
    return search.every(tile => tileset.has(tile))
  }

  isWalkable (at: Coords): boolean {
    this.assertMapContains(at)
    return !this.has(Tile.Block, at)
  }

  private assertMapContains (at: Coords): void {
    if (!this.contains(at)) {
      throw new OutOfMapError(at, this.size)
    }
  }
}

export default WorldMap
