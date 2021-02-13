import 'module-alias/register'
import { GameManager } from './game/GameManager'
import NoiseFactory, { MatrixGeneratorArgs, MatrixPipeline } from './map/builder/generator/NoiseFactory'
import { matrix } from './map/builder/generator/helpers'

// const gameManager = new GameManager()
// const gameId = gameManager.make()
// const outbreak = gameManager.get(gameId)
// outbreak.render()

const noise = new NoiseFactory('seed3')

const valleyGenerator = (args: MatrixGeneratorArgs): number => args.perlin.octavate(2, .1 * args.x, .1 * args.y, Math.sin(args.x * 1e-2))
const valley: MatrixPipeline = [ valleyGenerator, matrix.sharpen, matrix.normalize ]
const nm2 = noise.build(valley, { width: 60, height: 15 })

console.log(matrix.debug(nm2))

const not_nm2 = matrix.add(nm2,-0.2)
console.log(matrix.debug(not_nm2))

const barCode: MatrixPipeline = [
  (args: MatrixGeneratorArgs): number => args.simplex.octavate(2, args.x, .3),
  matrix.normalize
]

let nm3
nm3 = noise.build(barCode, { width: 20, height: 5 })
console.log(matrix.debug(nm2, { colorize: { lte: .3 } }))
nm3 = matrix.add(nm2, -.3)

console.log(matrix.debug(nm3))
