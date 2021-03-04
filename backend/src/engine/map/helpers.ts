import { Tile, Tiles, Tileset } from '@engine/types'

export function toTiles (tiles: Tiles): Array<Tile> {
  return ([] as Tile[]).concat(tiles)
}

export function toTileset (tiles: Tiles | Tileset): Tileset {
  return new Set(tiles instanceof Set ? tiles : toTiles(tiles))
}
