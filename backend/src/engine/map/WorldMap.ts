import { Coords, Tile, Index, Tileset, Around, InMapTileset, Direction, DirectionInDegree } from '../types'
import { OutOfMapError } from './WorldMapErrors'
import { isCoords, isIndex } from '../guards'
import { Seeder } from '#engine/map/builder/MapBuilder'
import { InvalidArgumentError, expect } from '#common/Errors'
import { getSanitizedTileset } from '#engine/map/tilerules'
import { Values, OneOrMany } from '#common/types'
import { deleteInSet, toArray } from '#common/helpers'
import { EventEmitter } from '#common/TypedEventEmitter'
import { calculateDestination } from '#engine/math/geometry'
import { WorldMapEvents } from '#engine/events'
import { Size } from '#shared/types'

/**
 * A 2D map structure describing the game board
 *
 * Emitted events:
 * | Name                 | Handler signature                                      |
 * |----------------------|--------------------------------------------------------|
 * | `tile:added`         | ({ tile: Tile, at: Coords, originalTileset: Tileset }) |
 * | `tile:${Tile}:added` | (at: Coords, originalTileset: Tileset)                 |
 */
export class WorldMap extends EventEmitter<WorldMapEvents> {
  static readonly defaultTile = Tile.Grass
  static readonly emptyTileset: Tileset = new Set<Tile>([ WorldMap.defaultTile ])

  readonly size: Size
  readonly seeder?: Seeder
  readonly name: string

  private readonly tiles = new Map<Index, Tileset>()

  constructor (size: Size, seeder?: Seeder) {
    super()
    this.size = size
    this.seeder = seeder
    this.name = 'Unnamed map'
  }

  /**
   * @return Number of added tiles (may differ from `tiles` size due to tiles rules)
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
          const newTiles = deleteInSet<Tileset>(merge, existingTiles)
          this.tiles.set(index, getSanitizedTileset([ ...existingTiles, ...newTiles ], true))
          added += this.emitTileAdded(newTiles, here, existingTiles)
        }
      } else {
        this.tiles.set(index, tileset)
        added += this.emitTileAdded(tileset, here)
      }
    }
    return added
  }

  private emitTileAdded (tileset: Tileset, at: Coords, original?: Tileset): number {
    const originalTileset = original ?? WorldMap.emptyTileset
    tileset.forEach(tile => {
      this.emit(`tile:${tile}:added`, { at, originalTileset })
      this.emit('tile:added', { tile, at, originalTileset })
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
      this.tiles.set(WorldMap.index(here), tileset)
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

  replace (wanted: Tile, substitute: Tile | null, at: OneOrMany<Coords>): void {
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
          ...(substitute ? [ substitute ] : []),
        ], here)
      }
    }
  }

  /**
   * @throws OutOfMapError
   */
  get (at: Coords | Index): Tileset {
    let index: Index
    let coords: Coords
    if (isIndex(at)) {
      index = at
      coords = WorldMap.coords(at)
    } else {
      index = WorldMap.index(at)
      coords = at
    }
    this.assertMapContains(coords)
    const tiles = this.tiles.get(index)
    // Returns new Set to avoid `this.tiles` manipulation outside WorldMap
    return new Set(tiles ? tiles : WorldMap.emptyTileset)
  }

  getNeighborsCoords (at: Coords, includeAt = false): Array<Coords> {
    const xMin = at.x - 1
    const yMin = at.y - 1
    const xMax = at.x + 1
    const yMax = at.y + 1

    return [
      { x: xMin, y: yMin },
      { x: at.x, y: yMin },
      { x: xMax, y: yMin },
      { x: xMin, y: at.y },
      ...(includeAt ? [ at ] : []),
      { x: xMax, y: at.y },
      { x: xMin, y: yMax },
      { x: at.x, y: yMax },
      { x: xMax, y: yMax },
    ].filter(here => this.contains(here))
  }

  getAround (at: Coords): Around {
    const around: Around = new Map()
    for (let direction = 0; direction < 8; direction++) {
      try {
        around.set(
          direction as Values<typeof Direction>,
          this.get(calculateDestination(at, DirectionInDegree[direction], 1))
        )
      } catch (e) {
        // Do nothing
        expect(e, OutOfMapError)
      }
    }
    return around
  }

  /**
   * @throws OutOfMapError
   * @throws InvalidArgumentError
   */
  extract (center: Coords, surface: Size): WorldMap {
    this.assertMapContains(center)
    if ((surface.width - 1) % 2 !== 0 || (surface.height - 1) % 2 !== 0) {
      throw new InvalidArgumentError('surface Size must be odd')
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
    this.tiles.forEach((tileset, index) => callback({
      tileset,
      at: WorldMap.coords(index)
    }))
  }

  has (tiles: OneOrMany<Tile>, at: Coords): boolean {
    try {
      const tileset = this.get(at)
      return toArray<Tile>(tiles).every(tile => tileset.has(tile))
    } catch (e) {
      // Do nothing
      expect(e, OutOfMapError)
    }
    return false
  }

  /**
   * @throws OutOfMapError
   */
  isWalkable (at: Coords): boolean {
    this.assertMapContains(at)
    return !(this.has(Tile.Block, at) || this.has(Tile.TemporaryBlock, at))
  }

  contains (point: Coords): boolean {
    return point.x >= 0 && point.x < this.size.width && point.y >= 0 && point.y < this.size.height
  }

  /**
   * @throws OutOfMapError
   */
  assertMapContains (at: Coords): void {
    if (!this.contains(at)) {
      throw new OutOfMapError(at, this.size)
    }
  }

  static index (at: Coords): Index {
    return `${at.x},${at.y}`
  }

  static coords (index: Index): Coords {
    const [ x, y ] = index.split(',')
    return { x: Number(x), y: Number(y) }
  }
}
