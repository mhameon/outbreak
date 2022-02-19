import { CustomError } from '#shared/Errors'
import { Coords, Size, Tile } from '../types'
import { OneOrMany } from '#shared/types'
import { toArray } from '#shared/helpers'

export function stringifyTiles (tiles: OneOrMany<Tile>): string {
  return `[${toArray<Tile>(tiles).map(id => (`${id}/${Tile[id]}`)).join(', ')}]`
}

export class OutOfMapError extends CustomError {
  constructor (at: Coords, size: Size) {
    super(`Coords ${at.x},${at.y} is outside map (${size.width}x${size.height})`, false)
  }
}

export class UnknownRenderTile extends CustomError {
  constructor (tiles: Array<Tile>) {
    super(`No RenderTile found for tiles ${stringifyTiles(tiles)}`)
  }
}
