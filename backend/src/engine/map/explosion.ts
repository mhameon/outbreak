import { Coords } from '@engine/types'
import { calculateDestination, line } from '@engine/math/geometry'


export function explosion (at: Coords, intensity: number): Set<Coords> {
  let blast: Array<Coords> = []

  //intensity = 2
  const branches = Math.floor(Math.pow(intensity + 1, 2)/2)
  //const branches = Math.pow(intensity, intensity + 1)
  const angle = {
    start: 0,
    step: 360 / branches
  }

  for (let branch = 0; branch < branches; branch++) {
    const ray = line(at, calculateDestination(at, angle.start + branch * angle.step, intensity))
    console.log(ray)
    blast = blast.concat(ray)
  }
  return new Set<Coords>(blast)
}
