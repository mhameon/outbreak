import MapRenderer from '../MapRenderer'
import { Tileset, RenderTile } from '@engine/types'
import chalk from 'chalk'
import { getRenderTile } from '@engine/map/tilerules'
import WorldMap from '@engine/map/WorldMap'

const TileAtlas: string[] = []
TileAtlas[RenderTile.Grass] = chalk.bgHex('#23301A').hex('#465C38')('░')
TileAtlas[RenderTile.BurningGrass] = chalk.bgHex('#ef390b').hex('#f8ea00')('░')
TileAtlas[RenderTile.BurnedGrass] = chalk.bgHex('#401d00').hex('#000000')('░')
TileAtlas[RenderTile.Forest] = chalk.bgHex('#23301A').hex('#465C38')('▒')
TileAtlas[RenderTile.BurningForest] = chalk.bgHex('#ef390b').hex('#f8ea00')('░')
TileAtlas[RenderTile.BurnedForest] = chalk.bgHex('#000000').hex('#23301A')('░')
TileAtlas[RenderTile.Road] = chalk.bgHex('#414040').white('·')
TileAtlas[RenderTile.BurningRoad] = chalk.bgHex('#ef390b').hex('#000000')('▒')
TileAtlas[RenderTile.BurnedRoad] = chalk.bgHex('#414040').hex('#000000')('▒')
TileAtlas[RenderTile.Bridge] = chalk.bgHex('#515050').white(' ')
TileAtlas[RenderTile.Water] = chalk.bgHex('#253D9D').hex('#3F7DAA')('~')
TileAtlas[RenderTile.Building] = chalk.bgHex('#888888')(' ')
TileAtlas[RenderTile.BuildingL1] = chalk.bgHex('#888888')(' ')
TileAtlas[RenderTile.BuildingL2] = chalk.bgHex('#999999')(' ')
TileAtlas[RenderTile.BuildingL3] = chalk.bgHex('#AAAAAA')(' ')
TileAtlas[RenderTile.BuildingL4] = chalk.bgHex('#BBBBBB')(' ')
TileAtlas[RenderTile.BuildingL5] = chalk.bgHex('#CCCCCC')(' ')
//TileAtlas[RenderTile.BurnedBuilding,
TileAtlas[RenderTile.BurningBuildingL1] = chalk.bgHex('#ef390b').hex('#f8ea00')('░')
TileAtlas[RenderTile.BurningBuildingL2] = chalk.bgHex('#ef390b').hex('#f8ea00')('░')
TileAtlas[RenderTile.BurningBuildingL3] = chalk.bgHex('#ef390b').hex('#f8ea00')('░')
TileAtlas[RenderTile.BurningBuildingL4] = chalk.bgHex('#ef390b').hex('#f8ea00')('░')
TileAtlas[RenderTile.BurningBuildingL5] = chalk.bgHex('#ef390b').hex('#f8ea00')('░')
// TileAtlas[RenderTile.BurnedBuildingL1,
// TileAtlas[RenderTile.BurnedBuildingL2,
// TileAtlas[RenderTile.BurnedBuildingL3,
// TileAtlas[RenderTile.BurnedBuildingL4,
// TileAtlas[RenderTile.BurnedBuildingL5

class AsciiMapRenderer extends MapRenderer {
  protected renderer (): string {
    const width = { length: this.map.size.width }
    const height = { length: this.map.size.height }

    const seeder = this.map.seeder ? ` ${this.map.seeder.builder}(${this.map.seeder.seed})` : ''
    let tiles,
      ascii = chalk.underline(`${this.map.name} (${this.map.size.width}x${this.map.size.height})`) + seeder + '\n'
    Array.from(height, (_, y) => {
      Array.from(width, (_, x) => {
        tiles = this.map.get({ x, y })
        ascii += AsciiMapRenderer.draw(tiles)
      })
      ascii += '\n'
    })
    return ascii
  }

  private static draw (tileset: Tileset): string {
    try {
      return TileAtlas[getRenderTile([ ...tileset ])]
    } catch (e) {
      try {
        return TileAtlas[getRenderTile([ ...tileset, ...WorldMap.emptyTileset ])]
      } catch (e) {
        // Do Nothing
      }
    }
    return chalk.red('?')
  }
}

export default AsciiMapRenderer
