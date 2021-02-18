import { matrix, NoiseFactory } from '@engine/math'
import MapBuilder from '@engine/map/builder/MapBuilder'
import WorldMap from '@engine/map/WorldMap'
import { Tile, TileLevel } from '@engine/types'
import { line } from '@engine/math/geometry'
import AsciiMapRenderer from '@engine/map/renderer/ascii/AsciiMapRenderer'

const { normalize, cap } = matrix

export class CityMapBuilder2 extends MapBuilder {
  protected build (): WorldMap {

    const noise = new NoiseFactory(this.seed)

    // const roads = noise.build(
    //   this.map.size,
    //   ({ simplex, x, y }): number => simplex.gen(.1 * x, .1 * y, Math.sin(x * 1e-2)),
    //   cap(-.3, 10), matrix.sharpen, normalize
    // )
    // console.log(matrix.debug(roads, { colorize: { lte: .15 } }))
    //
    // matrix.each(({ coords, value }) => {
    //   if (value <= .15) {
    //     this.map.add(Tile.Road, coords)
    //   }
    // }, roads)


    const world = noise.build(
      this.map.size,
      ({ perlin, x, y }) => perlin.octavate(2, x * .08, y * .08),
      cap(-1, 10), normalize,
    )
    //console.log(matrix.debug(world))

    const thresholds = {
      buildLevels: [ .35, .5, .65, .8, .92, 1 ],
      water: .2,
    }
    matrix.each(({ coords, value }) => {
      if (value > thresholds.buildLevels[0]) {
        const floor = thresholds.buildLevels.findIndex(v => value <= v)
        this.map.add(Tile.Building, coords)
        this.map.add(Tile[`Level${floor}` as TileLevel], coords)
      }
      if (value <= thresholds.water) {
        this.map.set([ Tile.Water, Tile.Block ], coords)
      }
    }, world)

    this.map.set(Tile.Fire, line({ x: 0,y: 0 }, { x: 10,y: 8 }))

    console.log(new AsciiMapRenderer(this.map.extract({ x: 2,y: 2 }, { width: 5, height: 5 })).render())

    // Idea: Use biggest population center as outbreak start location
    // const populationDensity = matrix.create(this.map.size, 0)
    // const levels = [ Tile.Level1, Tile.Level2, Tile.Level3, Tile.Level4, Tile.Level5 ]
    // this.map.each((square) => {
    //   let sum = 0
    //   const around = this.map.getAround(square.coords)
    //   around.forEach(tileset => {
    //     if (tileset.has(Tile.Building)) {
    //       const level = levels.find(level => tileset.has(level)) ?? 0
    //       sum += level
    //     }
    //   })
    //   populationDensity[square.coords.y][square.coords.x] = sum / around.size
    // })
    // console.log(matrix.debug(matrix.normalize(populationDensity), { colorize: { gte: .85 } }))

    return this.map
  }

}
