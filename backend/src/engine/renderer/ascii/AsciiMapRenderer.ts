import { RenderTile, Coords } from '#engine/types'
import chalk from 'chalk'
import { getRenderTile } from '#engine/map/tilerules'
import { WorldMap } from '#engine/map/WorldMap'
import { Outbreak } from '#engine/outbreak/index'
import { MapRenderer, STANDALONE_RENDER } from '#engine/renderer/MapRenderer'
import { Wind } from '#engine/outbreak/environment/Wind'
import { Zombie, Entity, EntityType } from '#engine/outbreak/entities/types'

const TileAtlas: string[] = []
TileAtlas[RenderTile.Grass] = chalk.bgHex('#23301A').hex('#465C38')('░')
TileAtlas[RenderTile.BurningGrass] = chalk.bgHex('#ef390b').hex('#f8ea00')('░')
TileAtlas[RenderTile.BurnedGrass] = chalk.hex('#401d00').bgHex('#000000')('░')
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
TileAtlas[RenderTile.BurningBuildingL1] = chalk.bgHex('#ef390b').hex('#f8ea00')('░')
TileAtlas[RenderTile.BurningBuildingL2] = chalk.bgHex('#ef390b').hex('#f8ea00')('░')
TileAtlas[RenderTile.BurningBuildingL3] = chalk.bgHex('#ef390b').hex('#f8ea00')('░')
TileAtlas[RenderTile.BurningBuildingL4] = chalk.bgHex('#ef390b').hex('#f8ea00')('░')
TileAtlas[RenderTile.BurningBuildingL5] = chalk.bgHex('#ef390b').hex('#f8ea00')('░')
TileAtlas[RenderTile.BurnedBuildingL1] = chalk.hex('#000000').bgHex('#888888')('▒')
TileAtlas[RenderTile.BurnedBuildingL2] = chalk.hex('#000000').bgHex('#999999')('▒')
TileAtlas[RenderTile.BurnedBuildingL3] = chalk.hex('#000000').bgHex('#AAAAAA')('▒')
TileAtlas[RenderTile.BurnedBuildingL4] = chalk.hex('#000000').bgHex('#BBBBBB')('▒')
TileAtlas[RenderTile.BurnedBuildingL5] = chalk.hex('#000000').bgHex('#CCCCCC')('▒')
TileAtlas[RenderTile.Sound] = chalk.hex('#d20ae5')('♫')

export class AsciiMapRenderer extends MapRenderer {
  protected renderer (outbreak: Outbreak): string {
    let asciiMap = ''
    let previousAt: Coords = { x: 0, y: 0 }
    outbreak.map.each(({ at }) => {
      if (previousAt.y !== at.y) {
        asciiMap += '\n'
      }

      asciiMap += AsciiMapRenderer.draw(outbreak, at)

      previousAt = { ...at }
    })

    if (outbreak.id === STANDALONE_RENDER) {
      return asciiMap
    }
    const seeder = outbreak.map.seeder ? `built with ${outbreak.map.seeder.builder}(${outbreak.map.seeder.seed})` : ''
    const windForce = (''.padEnd(outbreak.wind.force, '◼')) + (''.padEnd(Wind.maxForce - outbreak.wind.force, '◻'))
    return ''
      + `Outbreak: ${outbreak.id} (${outbreak.createdAt.toISOString()})\n`
      + `Map     : "${outbreak.map.name}" (${outbreak.map.size.width}x${outbreak.map.size.height}) ${seeder}\n`
      + `Wind    : ${outbreak.wind.arrow} ${outbreak.wind.angle}° ${windForce} Force ${outbreak.wind.force}\n`
      + `Turn    : ${outbreak.currentTurn || 'Not started'}\n`
      + asciiMap
  }

  private static draw (outbreak: Outbreak, at: Coords): string {
    const tileset = outbreak.map.get(at)
    const creatures = outbreak.entity.get(at)
    if (creatures.length) {
      // EntityType values are based on Tile
      return AsciiMapRenderer.creature(creatures[0])
    }
    try {
      return TileAtlas[getRenderTile(tileset)]
    } catch (e) {
      try {
        return TileAtlas[getRenderTile([ ...tileset, ...WorldMap.emptyTileset ])]
      } catch (e) {
        // Do Nothing
      }
    }
    return chalk.hex('#ea6a6a').bgHex('#6c0101')('?')
  }

  static creature (creature: Entity): string {
    const facing = [ '↖', '↑', '↗', '←', '→', '↙', '↓', '↘' ]
    switch (creature.type) {
      case EntityType.Zombie:
        return chalk.hex('#FFF').bgHex('#C00')(facing[(creature as Zombie).facing])
      case EntityType.Human:
        return chalk.hex('rgba(29,107,3,0.25)').bgHex('#81f126')('☺︎︎')
    }
    return '?'
  }
}
