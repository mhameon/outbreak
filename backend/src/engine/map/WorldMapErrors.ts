import { CustomError } from '@shared/Errors'
import { Coords, Size, Tile, Tileset } from '../types'

export function stringifyTileset (tileset: Tileset | Array<Tile>): string {
  const stringifyTileset: Array<string> = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tileset.forEach((id: any) => stringifyTileset.push(`${id}/${Tile[id]}`))
  return `[${stringifyTileset.join(', ')}]`
}

export class OutOfMapError extends CustomError {
  constructor (at: Coords, size: Size) {
    super(`Coords ${at.x},${at.y} is outside map (${size.width}x${size.height})`, false)
  }
}

export class UnknownRenderTile extends CustomError {
  constructor (tiles: Array<Tile>) {
    super(`No RenderTile found for tiles ${stringifyTileset(tiles)}`)
  }
}
