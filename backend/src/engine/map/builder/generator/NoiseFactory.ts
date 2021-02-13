import { matrix } from '@engine/map/builder/generator/helpers'
import { Seed, Matrix2d, Matrix, Size } from '@engine/types'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tumult = require('tumult')

interface Tumult {
  gen (x: number, y: number, ...z: number[]): number //noise function
  octavate (octaves: number, x: number, y: number, ...z: number[]): number // fractal function
}

type MatrixTransformer = (matrix: Matrix) => Matrix
export type MatrixGeneratorArgs = { simplex: Tumult; perlin: Tumult; x: number; y: number; z?: number[] }
export type MatrixGenerator = (args: MatrixGeneratorArgs) => number
export type MatrixPipeline = MatrixGenerator | [MatrixGenerator, ...MatrixTransformer[]]

class NoiseFactory {
  readonly algorithm: { simplex: Tumult; perlin: Tumult }

  constructor (seed: Seed) {
    this.algorithm = {
      simplex: new tumult.Simplex2(seed),
      perlin: new tumult.PerlinN(seed),
    }
  }

  build (pipeline: MatrixPipeline, size: Size): Matrix2d {
    const generator = Array.isArray(pipeline) ? pipeline.shift() as MatrixGenerator : pipeline

    const noise = matrix.create(size, (x, y) => generator({ ...this.algorithm, x, y }))

    if (Array.isArray(pipeline)) {
      return (pipeline as MatrixTransformer[]).reduce(
        (matrix, transformer) => transformer(matrix),
        noise as Matrix,
      ) as Matrix2d
    }
    return noise as Matrix2d
  }
}

export default NoiseFactory
