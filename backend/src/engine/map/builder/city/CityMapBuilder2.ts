import { matrix } from '@engine/map/builder/generator/helpers'
import NoiseFactory, { MatrixPipeline } from '@engine/map/builder/generator/NoiseFactory'
import MapBuilder from '@engine/map/builder/MapBuilder'
import AsciiMapRenderer from '@engine/map/renderer/ascii/AsciiMapRenderer'
import WorldMap from '@engine/map/WorldMap'
import { Matrix2d, Seed, Tile, TileLevel } from '@engine/types'

export class CityMapBuilder2 extends MapBuilder {
  generate (seed?: Seed): WorldMap {
    this.seed = seed ?? 1588630129416 // Fixme hard coded seed for test purpose only

    const noise = new NoiseFactory(this.seed)

    //const valleyGenerator = (args: MatrixGeneratorArgs): number => args.perlin.octavate(2, .1 * args.x, .1 * args.y, Math.sin(args.x * 1e-2))
    const pipeline: MatrixPipeline = [
      ({ perlin, x, y }) => perlin.octavate(2, x * .08, y * .08),
      matrix.normalize,
    ]

    const world = noise.build(pipeline, this.map.size)
    console.log(matrix.debug(world))

    const thresholds = {
      buildLevels: [ .35, .5, .65, .8, .92, 1 ],
      water: .1,
    }

    matrix.travel(world, ({ coords, value }) => {
      if (value > thresholds.buildLevels[0]) {
        const floor = thresholds.buildLevels.findIndex(v => value <= v)
        this.map.add(Tile.Building, coords)
        this.map.add(Tile[`Level${floor}` as TileLevel], coords)
      }
      if (value <= thresholds.water) {
        this.map.add(Tile.Water, coords)
      }
    })

    const ascii = new AsciiMapRenderer(this.map)
    console.log(ascii.render())


    const populationDensity: Matrix2d = matrix.create(this.map.size, 0)

    const levels = [ Tile.Level1, Tile.Level2, Tile.Level3, Tile.Level4, Tile.Level5 ]
    this.map.each((square) => {
      let sum = 0
      const around = this.map.getAround(square.coords)
      around.forEach(tileset => {
        if (tileset.has(Tile.Building)) {
          const level = levels.find(level => tileset.has(level)) ?? 0
          sum += level
        }
      })
      populationDensity[square.coords.y][square.coords.x] = sum / around.size
    })

    console.log(matrix.debug(matrix.normalize(populationDensity), { colorize: { gte: .85 } }))

    return this.map
  }

}
