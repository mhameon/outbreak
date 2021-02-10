import { matrix } from '@engine/map/builder/generator/helpers'
import NoiseFactory, { MatrixPipeline } from '@engine/map/builder/generator/NoiseFactory'
import MapBuilder from '@engine/map/builder/MapBuilder'
import AsciiMapRenderer from '@engine/map/renderer/ascii/AsciiMapRenderer'
import WorldMap from '@engine/map/WorldMap'
import { Seed, Tile, TileLevel } from '@engine/type/outbreak'

export class CityMapBuilder2 extends MapBuilder {
  generate (seed?: Seed): WorldMap {
    this.seed = seed ?? 1588630129416 // Fixme hard coded seed for test purpose only

    const noise = new NoiseFactory(this.seed)

    //const valleyGenerator = (args: MatrixGeneratorArgs): number => args.perlin.octavate(2, .1 * args.x, .1 * args.y, Math.sin(args.x * 1e-2))
    const pipeline: MatrixPipeline = [
      ({ perlin, x, y }) => perlin.octavate(2, x * .1, y * .1),
      matrix.normalize
    ]
    const world = noise.build(pipeline, this.map.size)
    console.log(matrix.debug(world))

    const buildupAreaThreshold = .4
    const buildingFloorThresholds = [ .6, .8, .9, .94, 1 ]
    matrix.travel(world , ({ coords, value } ) => {
      if ( value >= buildupAreaThreshold) {
        const buildingFloor = 1 + buildingFloorThresholds.findIndex(v => v >= value)
        this.map.add(Tile.Building, coords)
        this.map.add(Tile[`Level${buildingFloor}` as TileLevel], coords)
      }
    })

    const ascii = new AsciiMapRenderer(this.map)
    console.log(ascii.render())

    return this.map
  }

}
