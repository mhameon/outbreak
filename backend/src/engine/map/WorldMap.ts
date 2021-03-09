import { Size, Coords, Tile, Index, Tileset, Around, InMapTileset, Direction } from '../types'
import { OutOfMapError } from './WorldMapErrors'
import { isCoordsArray, isCoords } from './guards'
import { Seeder } from '@engine/map/builder/MapBuilder'
import { InvalidArgumentError } from '@shared/Errors'
import { getSanitizedTileset } from '@engine/map/tilerules'
import { Values, OneOrMany } from '@shared/types'
import { EventEmitter } from 'events'
import { diffSet, toArray } from '@shared/helpers'

/**
 * A 2D map describing the game board.
 *
 * Emit events:
 * - `tile:added`, ({ tile: Tile, at: Coords })
 * - `tile:${Tile}:added`, (at: Coords)
 */
class WorldMap extends EventEmitter {
  static readonly defaultTile = Tile.Grass
  static readonly emptyTileset: Tileset = new Set<Tile>([ WorldMap.defaultTile ])
  readonly size: Size
  readonly seeder?: Seeder
  readonly name: string

  private tiles: Map<Index, Tileset>

  constructor (size: Size, seeder?: Seeder) {
    super()
    this.tiles = new Map()
    this.size = size
    this.seeder = seeder
    this.name = 'Unnamed map'
  }

  add (tiles: OneOrMany<Tile>, at: OneOrMany<Coords>): number {
    const coords = toArray(at)
    let added = 0
    let here!: Coords
    if (isCoordsArray(coords)) {
      here = coords.pop() as Coords
      if (isCoordsArray(coords)) {
        added += this.add(tiles, coords)
      }
    } else if (isCoords(coords)) {
      here = coords
    }

    if (this.contains(here)) {
      const index = WorldMap.index(here)
      const existing = this.tiles.get(index)
      const tileset = getSanitizedTileset(tiles)
      if (existing) {
        const merge = getSanitizedTileset([ ...existing, ...tileset ], true)
        if (merge.size) {
          this.tiles.set(index, merge)
          const newTiles = diffSet<Tileset>(merge, existing)
          added += this.emitTileAdded(newTiles, here)
        }
      } else {
        this.tiles.set(index, tileset)
        added += this.emitTileAdded(tileset, here)
      }
    }
    return added
  }

  private emitTileAdded (tileset: Tileset, at: Coords): number {
    tileset.forEach(tile => {
      this.emit(`tile:${tile}:added`, at)
      this.emit('tile:added', { tile, at })
    })
    return tileset.size
  }

  set (tiles: OneOrMany<Tile>, at: OneOrMany<Coords>): void {
    const coords = toArray<Coords>(at)
    let here!: Coords
    if (isCoordsArray(coords)) {
      here = coords.pop() as Coords
      if (isCoordsArray(coords)) {
        this.set(tiles, coords)
      }
    } else if (isCoords(coords)) {
      here = coords
    }

    const tileset = getSanitizedTileset(tiles, true)
    const index = WorldMap.index(here)
    this.tiles.delete(index)
    if (
      tileset.size >= 1
      && !(tileset.size === 1 && (tileset.has(Tile.Walkable) /*|| tileset.has(WorldMap.defaultTile)*/))
    ) {
      this.tiles.set(index, tileset)
    }
  }

  remove (tile: Tile, at: Coords): number {
    let removed = 0
    const existing = this.get(at)
    if (existing.has(tile)) {
      removed = Number(existing.delete(tile))
      this.set(existing, at)
    }
    return removed
  }

  replace (wanted: Tile, substitute: Tile, at: OneOrMany<Coords>): void {
    const coords = toArray<Coords>(at)
    let here!: Coords
    if (isCoordsArray(coords)) {
      here = coords.pop() as Coords
      if (isCoordsArray(coords)) {
        this.replace(wanted, substitute, coords)
      }
    } else if (isCoords(coords)) {
      here = coords
    }

    const tile = this.get(here)
    if (tile.has(wanted)) {
      tile.delete(wanted)
      this.set([
        ...(getSanitizedTileset(tile, true).size ? tile : WorldMap.emptyTileset),
        substitute
      ], here)
    }
  }

  get (at: Coords): Tileset {
    this.assertMapContains(at)
    const tiles = this.tiles.get(WorldMap.index(at))
    // Returns new Set to avoid `this.tiles` manipulation outside WorldMap
    return new Set(tiles ? tiles : WorldMap.emptyTileset)
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
            around.set(direction as Values<typeof Direction>, this.get({ x, y }))
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
        region.set(this.get({ x, y }), destination)
        ++destination.x
      }
      ++destination.y
    }
    return region
  }

  each (callback: (square: InMapTileset) => void): void {
    this.tiles.forEach(
      (tileset, index) => callback({ tileset, at: WorldMap.coords(index) }),
    )
  }

  has (tiles: OneOrMany<Tile>, at: Coords): boolean {
    const tileset = this.get(at)
    return toArray<Tile>(tiles).every(tile => tileset.has(tile))
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
