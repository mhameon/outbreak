import MapRenderer from '../MapRenderer'
import { Tile } from '../../../@types/outbreak'

const enum Ascii {
  Block = '▓'
}

class AsciiMapRenderer extends MapRenderer {
  render (): string {
    let tile
    let ascii = String().padEnd(this.map.size.width + 2, Ascii.Block)
    for (let y = 0; y < this.map.size.height; y++) {
      ascii += `\n${Ascii.Block}`
      for (let x = 0; x < this.map.size.width; x++) {
        tile = this.map.get({ x, y })
        if (tile.has(Tile.Walkable)) {
          ascii += ' '
        } else {
          if (tile.has(Tile.Block)) {
            ascii += Ascii.Block
          }
        }
      }
      ascii += Ascii.Block
    }
    ascii += '\n' + String().padEnd(this.map.size.width + 2, Ascii.Block)

    return ascii
  }
}

export default AsciiMapRenderer
