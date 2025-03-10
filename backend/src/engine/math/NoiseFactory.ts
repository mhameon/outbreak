import { matrix, MatrixTransformer } from '#engine/math/matrix'
import { Seed, Matrix2d } from '#engine/types'
import { pipe } from '#common/helpers'
import assert from 'assert'
import { type Coords, Size } from '#shared/types'
import { isNumber } from '#common/guards'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tumult = require('tumult')

interface Tumult {
  gen (x: number, y: number, ...z: number[]): number //noise function
  octavate (octaves: number, x: number, y: number, ...z: number[]): number // fractal function
}

type NoiseAlgorithm = { simplex: Tumult; perlin: Tumult }
export type MatrixGenerator = (args: NoiseAlgorithm & Coords) => number
export type MatrixPipeline = MatrixGenerator | [ MatrixGenerator, ...MatrixTransformer[] ]

/**
 * Build
 */
export class NoiseFactory {
  readonly algorithm: NoiseAlgorithm

  constructor (seed: Seed) {
    this.algorithm = {
      simplex: new tumult.Simplex2(seed),
      perlin: new tumult.PerlinN(seed)
    }
  }

  build (size: Size, generator: MatrixGenerator, ...pipeline: MatrixTransformer[]): Matrix2d {
    const noise = matrix.create(size, (x, y) => generator({ ...this.algorithm, x, y }))
    assert(isNumber(noise[0][0]), 'Noise generation failure!')
    return pipe(noise)(...pipeline)
  }
}
