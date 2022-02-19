import { matrix } from '#engine/math/index'
import { NoiseFactory, MatrixPipeline } from './math/NoiseFactory'
import { WorldMap } from '#engine/map/WorldMap'
import { Renderers } from '#engine/renderer'
import { explosion } from '#engine/map/explosion'
import { Tile, Size, Seed, Coords, Matrix2d } from '#engine/types'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tumult = require('tumult')

// const noise = new NoiseFactory('seed3')
//
// const valley = noise.build({ width: 60, height: 15 },
//   (args): number => args.perlin.octavate(2, .1 * args.x, .1 * args.y, Math.sin(args.x * 1e-2)),
//   matrix.sharpen,
//   matrix.normalize
// )
//
// console.log(matrix.debug(valley))
//
// const not_valley = matrix.add(-0.2, valley)
// console.log(matrix.debug(not_valley))
//
//
// let barCode
// barCode = noise.build({ width: 20, height: 5 },
//   (args): number => args.simplex.octavate(2, args.x, .3),
//   matrix.normalize
// )
// console.log(matrix.debug(valley, { colorize: { lte: .3 } }))
// barCode = matrix.add(-.3, valley)
//
// console.log(matrix.debug(barCode))

const size = { width: 30, height: 15 }
const map = new WorldMap(size)
//const mat = matrix.create(size, .5)

//console.log(matrix.debug(mat))

const ascii = Renderers.Ascii()

let blast
blast = explosion({ x: 15, y: 7 }, 3)


map.add(Tile.Burning, blast)

console.log(ascii.render(map))
