import { Coords, Tile } from '@engine/types'
import { calculateDestination } from '@engine/math/geometry'
import { Resolver } from './Resolver'

export class FireResolver extends Resolver {
  resolve (): void {
    this.log.profile('fire')

    let burningTiles = 0, newIgnitions = 0
    const ignitions = new Set<Coords>()
    const ashes = new Set<Coords>()
    this.outbreak.map.each(({ tileset, at }) => {
      if (tileset.has(Tile.Burning)) {
        burningTiles++

        //if (random.chance(75)) {
        const destination = calculateDestination(at, this.outbreak.wind.angle)
        ignitions.add(destination)
        //}

        //if ( random.chance(50) ) {
        ashes.add(at)
        //}
      }
    })

    if (ignitions.size > 0) {
      ignitions.forEach(flamingCoords => ashes.delete(flamingCoords))
      newIgnitions += this.outbreak.map.add(Tile.Burning, [ ...ignitions ])
    }
    if (ashes.size > 0) {
      this.outbreak.map.replace(Tile.Burning, Tile.Burned, [ ...ashes ])
    }
    this.log.debug(`${burningTiles} burning tiles generates ${newIgnitions} new ignitions`)

    this.log.profile('fire', { message: '🔥 Fire propagation resolved', level: 'debug' })
  }
}
