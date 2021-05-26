import { Size, Coords, Tile, Index, Tileset, Around, InMapTileset, Direction } from '../types'
import { OutOfMapError } from './WorldMapErrors'
import { isCoords } from './guards'
import { Seeder } from '@engine/map/builder/MapBuilder'
import { InvalidArgumentError } from '@shared/Errors'
import { getSanitizedTileset, addSanitizedTileset } from '@engine/map/tilerules'
import { Values, OneOrMany } from '@shared/types'
import { diffSet, toArray } from '@shared/helpers'
import { EventEmitter } from 'events'

/**
 * A 2D map structure describing the game board
 *
 * Emit events
 * | Event                | Signature                                              |
 * |----------------------|--------------------------------------------------------|
 * | `tile:added`         | `({ tile: Tile, at: Coords }, existingTiles: Tileset)` |
 * | `tile:${Tile}:added` | `(at: Coords, existingTiles: Tileset)`                 |
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

  /**
   * @return Number of added tiles (can differs from `tiles` size due to tiles rules)
   * @see tilerules.ts
   */
  add (tiles: OneOrMany<Tile>, at: OneOrMany<Coords>): number {
    let added = 0
    const coords = toArray(at)
    const here = coords.pop()
    if (coords.length) {
      added += this.add(tiles, coords)
    }

    if (isCoords(here) && this.contains(here)) {
      const index = WorldMap.index(here)
      const existingTiles = this.tiles.get(index)
      const tileset = getSanitizedTileset(tiles)
      if (existingTiles) {
        //const merge = addSanitizedTileset(existingTiles, tileset)
        const merge = getSanitizedTileset([ ...existingTiles, ...tileset ], true)
        if (merge.size) {
          this.tiles.set(index, merge)
          const newTiles = diffSet<Tileset>(merge, existingTiles)
          added += this.emitTileAdded(newTiles, here, existingTiles)
        }
      } else {
        this.tiles.set(index, tileset)
        added += this.emitTileAdded(tileset, here)
      }
    }
    return added
  }

  private emitTileAdded (tileset: Tileset, at: Coords, existing?:Tileset): number {
    const existingTiles = existing ?? WorldMap.emptyTileset
    tileset.forEach(tile => {
      this.emit(`tile:${tile}:added`, at, existingTiles)
      this.emit('tile:added', { tile, at }, existingTiles)
    })
    return tileset.size
  }

  set (tiles: OneOrMany<Tile>, at: OneOrMany<Coords>): void {
    const coords = toArray<Coords>(at)
    const here = coords.pop()
    if (coords.length) {
      this.set(tiles, coords)
    }

    if (isCoords(here)) {
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
  }

  remove (tile: Tile, at: Coords): number {
    let removed = 0
    try {
      const existing = this.get(at)
      if (existing.has(tile)) {
        removed = Number(existing.delete(tile))
        this.set(existing, at)
      }
    } catch (e) {
      // Do nothing
    }
    return removed
  }

  replace (wanted: Tile, substitute: Tile, at: OneOrMany<Coords>): void {
    const coords = toArray<Coords>(at)
    const here = coords.pop()
    if (coords.length) {
      this.replace(wanted, substitute, coords)
    }

    if (isCoords(here)) {
      const tile = this.get(here)
      if (tile.has(wanted)) {
        tile.delete(wanted)
        this.set([
          ...(getSanitizedTileset(tile, true).size ? tile : WorldMap.emptyTileset),
          substitute
        ], here)
      }
    }
  }

  /**
   * @throws OutOfMapError
   */
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

  /**
   * @throws OutOfMapError
   */
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
    try {
      const tileset = this.get(at)
      return toArray<Tile>(tiles).every(tile => tileset.has(tile))
    } catch (e) {
      // Do nothing
    }
    return false
  }

  /**
   * @throws OutOfMapError
   */
  isWalkable (at: Coords): boolean {
    this.assertMapContains(at)
    return !this.has(Tile.Block, at)
  }

  contains (point: Coords): boolean {
    return point.x >= 0 && point.x < this.size.width && point.y >= 0 && point.y < this.size.height
  }

  /**
   * @throws OutOfMapError
   */
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
