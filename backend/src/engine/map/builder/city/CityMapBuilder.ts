import AsciiMapRenderer from '../../renderer/ascii/AsciiMapRenderer'
import MapBuilder from '../MapBuilder'
import WorldMap from '../../WorldMap'
import { Tile, Coords, Seed } from '@engine/type/outbreak'
import { InvalidArgumentError } from '@shared/Errors'
import { line, calculateDestination } from '../../geometry'
import chalk from 'chalk'
import { matrix } from '../generator/helpers'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tumult = require('tumult')

type TileLevel = 'Level0' | 'Level1' | 'Level2' | 'Level3' | 'Level4' | 'Level5'

class CityMapBuilder extends MapBuilder {
  seed?: Seed

  generate (seed?: Seed): WorldMap {
    this.seed = seed ?? 1588630129416 //+(new Date()) //this.map?.name
    //this.seed = +(new Date()) //this.map?.name
    const buildupAreaThreshold = .4

    let output = ''
    let rgb
    let x = 0, y = 0
    const width = this.map.size.width
    const height = this.map.size.height
    const len = width * height

    const normalised = matrix.normalize(this.makeNoise(this.seed, 16))

    const buildingFloorThresholds = [ .6, .8, .9, .94, 1 ]
    let buildingFloor, level
    let item: number

    for (let i = 0; i < len; i++) {
      if (i > 0 && i % width === 0) {
        output += '\n'
        x = 0
        y++
      }
      item = normalised[i] as number
      if (buildupAreaThreshold > 0 && item >= buildupAreaThreshold) {
        buildingFloor = 1 + buildingFloorThresholds.findIndex(v => item <= v)

        output += chalk.bgRgb(Math.round(200 * item), 0, 0).red(`${buildingFloor}`)

        this.map.add(Tile.Building, { x, y })
        level = `Level${buildingFloor}`
        this.map.add(Tile[level as TileLevel], { x, y })
        // outbreak.map.add(Tile.Road, { x, y })
      }
      else {
        rgb = Math.round(255 * item)
        output += chalk.bgRgb(rgb, rgb, rgb)(' ')
      }
      x++
    }

    console.log(this.getSeeder())
    console.log(`Buildup area>=${buildupAreaThreshold} (${buildingFloorThresholds.length} floors max)`)
    console.log(output)
    console.log(matrix.debug(normalised))
    // const ascii = new AsciiMapRenderer(this.map)
    // console.log(ascii.render())

    const w25 = Math.floor(this.map.size.width / 4)
    const h25 = Math.floor(this.map.size.height / 4)
    // x = random.range(w25, 3 * w25)
    // y = random.range(h25, 3 * h25)
    //this.map.add(Tile.Block, { x, y })

    //this.map.add(Tile.Block, { x: width - 1, y: height - 1 })
    //this.map.add(Tile.Road, line({ x: 10, y: 5 }, { x: 30, y: 17 }))


    //Horizontal River
    // let source = { x: 0, y: random.range(h25, 3 * h25) }
    // let step: Coords
    // do {
    //   step = calculateDestination(source, random.choose(-45, 0, 45), random.range(4, 6))
    //   this.map.set(Tile.Water, line(source, step, 3))
    //   source = step
    // } while (step.x < width)

    //Sinusoid River
    // source = { x: 0, y: 15 }
    // for (x = 0; x < width; x++) {
    //   y = Math.round(15 + 3 * Math.sin(.3* x))
    //   step = { x, y }
    //   this.map.add(Tile.Water, line(source, step, 2))
    //   source = step
    // }

    //this.map.set(Tile.Road, line({ x: 10, y: 0 }, { x: 11, y: height - 1 }, 1))

    return this.map
  }

  private makeNoise (seed: Seed, noiseFrequency = 16): number[] {
    const noise = new tumult.Perlin2(seed)

    const heightmap = []
    for (let y = 0; y < this.map.size.height; y++) {
      for (let x = 0; x < this.map.size.width; x++) {
        heightmap.push(
          // noise.octavate(2, x / noiseFrequency, y / noiseFrequency)
          noise.octavate(2, x * .1, y * .1),
        )
      }
    }
    return heightmap
  }


}


export default CityMapBuilder
