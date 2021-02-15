import MapRenderer from '../MapRenderer'
import { Tile, Tileset } from '@engine/types'
import chalk from 'chalk'

const Ascii = {
  Block: chalk.bgHex('#CCCCCC')(' '),
  Grass: chalk.bgHex('#23301A').hex('#465C38')('░'),
  Road: chalk.bgHex('#414040').white('·'),
  Bridge: chalk.bgHex('#515050').white(' '),
  Water: chalk.bgHex('#253D9D').hex('#3F7DAA')('~'),
  Building: {
    'L1': chalk.bgHex('#888888')(' '),
    'L2': chalk.bgHex('#999999')(' '),
    'L3': chalk.bgHex('#AAAAAA')(' '),
    'L4': chalk.bgHex('#BBBBBB')(' '),
    'L5': chalk.bgHex('#CCCCCC')(' '),
  }
}

class AsciiMapRenderer extends MapRenderer {
  protected renderer (): string {
    let tiles, ascii = chalk.underline(`${this.map.name} (${this.map.size.width}x${this.map.size.height})`) + '\n'
    for (let y = 0; y < this.map.size.height; y++) {
      for (let x = 0; x < this.map.size.width; x++) {
        tiles = this.map.get({ x, y })
        ascii += AsciiMapRenderer.draw(tiles)
      }
      ascii += '\n'
    }

    return ascii
  }

  private static draw (tileset: Tileset): string {
    const tiles = tileset.values()
    switch (tiles.next().value) {
      case Tile.Walkable:
        return Ascii.Grass
      case Tile.Block:
        return Ascii.Block
      case Tile.Building:
        switch (tiles.next().value) {
          default:
          case Tile.Level1: return Ascii.Building.L1
          case Tile.Level2: return Ascii.Building.L2
          case Tile.Level3: return Ascii.Building.L3
          case Tile.Level4: return Ascii.Building.L4
          case Tile.Level5: return Ascii.Building.L5
        }
      case Tile.Water:
        if (tiles.next().value === Tile.Road) {
          return Ascii.Bridge
        }
        return Ascii.Water
      case Tile.Road:
        return Ascii.Road
      default:
        return chalk.red('?')
    }
  }
}

export default AsciiMapRenderer
