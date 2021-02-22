import { CustomError } from '@shared/Errors'
import { Coords, Size, Tile, Tileset } from '../types'

export function stringifyTileset (tileset: Tileset): Array<string> {
  const stringifyTileset: Array<string> = []
  tileset.forEach(id => stringifyTileset.push(Tile[id]))
  return stringifyTileset
}

export class OutOfMapError extends CustomError {
  constructor (at: Coords, size: Size) {
    super(`Coords ${at.x},${at.y} is outside map (${size.width}x${size.height})`, false)
  }
}

export class SidekickTileLonelyUsageError extends CustomError {
  constructor (sidekick: Tile, tileset: Tileset) {
    super(`Sidekick tile "${Tile[sidekick]}" is used lonely in tileset [${stringifyTileset(tileset).join(', ')}]`)
  }
}
