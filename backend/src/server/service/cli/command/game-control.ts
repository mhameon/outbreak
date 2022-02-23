import { CommandLineInterface } from '#server/service/cli/CommandLineInterface'
import { Outbreak } from '#engine/outbreak/index'
import { Nullable } from '#shared/types'
import { Coords, RenderTile } from '#engine/types'
import { stringifyTiles } from '#engine/map/WorldMapErrors'
import { AsciiMapRenderer } from '#engine/renderer/ascii/AsciiMapRenderer'
import assert from 'assert'
import { InvalidArgumentError } from '#shared/Errors'
import { getRenderTile } from '#engine/map/tilerules'

export function registerGameControlCommands (cli: CommandLineInterface, getOutbreak: () => Nullable<Outbreak>): void {
  cli
    .registerCommand('game:set:wind', 'Change wind settings', setWind)
    .registerCommand('game:debug:at', 'Get map debug infos at specified coords', getDebugInfoAtCoords)

  function setWind (angle: string, force?: string): void {
    const outbreak = getOutbreak()
    if (outbreak) {
      outbreak.wind.angle = parseInt(angle, 10)
      if (force) {
        outbreak.wind.force = parseInt(force, 10)
      }
      cli.executeCommand('game:show')
    }
  }

  function getDebugInfoAtCoords (x: string, y?: string): void {
    const outbreak = getOutbreak()
    if (outbreak) {
      let at: Coords
      if (!y) {
        const coords = x.split(',')
        at = { x: parseInt(coords[0], 10), y: parseInt(coords[1], 10) }
      } else {
        at = { x: parseInt(x, 10), y: parseInt(y, 10) }
      }
      assert(at.x >= 0 && at.y >= 0, new InvalidArgumentError(`${at.x},${at.y} are not valid map coords`))

      const tileset = outbreak.map.get(at)
      const renderedTile = getRenderTile(tileset)
      const minimap = outbreak.map.extract(at, { width: 3, height: 3 })

      const render = new AsciiMapRenderer()
      const map = render.render(minimap).split('\n')
      const creatures = outbreak.creature.get(at)

      console.log(
        '   ▼\n' +
        `  ${map[0]}  At ${at.x},${at.y} - tiles ${stringifyTiles(tileset)}\n` +
        `︎︎▶${map[1]}  renders ${renderedTile}/${RenderTile[renderedTile]}, ${outbreak.map.isWalkable(at)?'':'NOT '}walkable\n` +
        `  ${map[2]}\n` +
        '       ' + creatures.map(c => JSON.stringify(c)).join('\n       ')
      )
    }
  }
}
