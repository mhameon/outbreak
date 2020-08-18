import { Seed, Matrix2d, Matrix, Size } from '../../../@types/outbreak'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tumult = require('tumult')

interface Tumult {
  gen (x: number, y: number, ...z: number[]): number //noise function
  octavate (octaves: number, x: number, y: number, ...z: number[]): number // fractal function
}

type MatrixTransformer = (matrix: Matrix) => Matrix
export type MatrixGeneratorArgs = { simplex: Tumult; perlin: Tumult; x: number; y: number; z?: number[] }
export type MatrixGenerator = (args: MatrixGeneratorArgs) => number
export type MatrixPipeline = MatrixGenerator | [ MatrixGenerator, ...MatrixTransformer[] ]

class NoiseFactory {
  readonly algorithm: { simplex: Tumult; perlin: Tumult }

  constructor (seed: Seed) {
    this.algorithm = {
      simplex: new tumult.Simplex2(seed),
      perlin: new tumult.PerlinN(seed)
    }
  }

  build (pipeline: MatrixPipeline, size: Size): Matrix {
    const generator = Array.isArray(pipeline) ? pipeline.shift() as MatrixGenerator : pipeline

    const noise: Matrix2d = Array(size.height)
    for (let y = 0; y < size.height; y++) {
      noise[y] = Array(size.width)
      for (let x = 0; x < size.width; x++) {
        noise[y][x] = generator({ ...this.algorithm, x, y })
      }
    }
    if (Array.isArray(pipeline)) {
      return (pipeline as MatrixTransformer[]).reduce((matrix, transformer) => transformer(matrix), noise as Matrix)
    }
    return noise
  }
}

export default NoiseFactory
