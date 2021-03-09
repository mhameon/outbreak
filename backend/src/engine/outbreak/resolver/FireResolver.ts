import { Coords, Tile } from '@engine/types'
import { calculateDestination } from '@engine/math/geometry'
import { Resolver } from './Resolver'
import { Outbreak } from '@engine/outbreak'

export class FireResolver extends Resolver {
  private flames: Set<Coords> = new Set()

  constructor (outbreak: Outbreak) {
    super(outbreak)
    // The parent constructor must be called by child to have access to child properties,
    // `this.flames` is undefined otherwise. Original implementation calling an override `boot` method can't works :(
    // See https://javascript.info/class-inheritance#overriding-class-fields-a-tricky-note

    this.outbreak.map.on(`tile:${Tile.Burning}:added`, (at: Coords) => {
      this.flames.add(at)
    })
  }

  resolve (): void {
    this.log.profile('fire')

    let ignitedTiles = 0
    const ignitions = new Set<Coords>()
    const ashes = new Set<Coords>()
    this.flames.forEach((at) => {
      //if (random.chance(75)) {
      const fire = calculateDestination(at, this.outbreak.wind.angle)
      ignitions.add(fire)
      //}

      //if ( random.chance(50) ) {
      ashes.add(at)
      //}
    })

    if (ignitions.size > 0) {
      ignitions.forEach(flamingCoords => ashes.delete(flamingCoords))
      ignitedTiles = this.outbreak.map.add(Tile.Burning, [ ...ignitions ])
    }
    if (ashes.size > 0) {
      this.outbreak.map.replace(Tile.Burning, Tile.Burned, [ ...ashes ])
      ashes.forEach(at => this.flames.delete(at))
    }

    this.log.debug(`${this.flames.size} burning tiles generates ${ignitedTiles} new ignitions`)
    this.log.profile('fire', { message: '🔥 Fire propagation resolved', level: 'debug' })
  }
}
