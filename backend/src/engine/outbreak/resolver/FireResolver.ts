import { Coords, Tile, Tileset } from '@engine/types'
import { calculateDestination } from '@engine/math/geometry'
import { Resolver } from './Resolver'
import { Outbreak } from '@engine/outbreak'
import { random } from '@engine/math'

interface FlameProps {
  lifetime: number
}

export class FireResolver extends Resolver {
  static readonly flame = {
    spreadAngle: 45,
    lifetime: [
      { for: Tile.Grass, lifetime: 5 }, //burn longer
      { for: Tile.Forest, lifetime: 6 },
      { for: Tile.Road, lifetime: 2 },
      { for: Tile.Building, lifetime: 3 }, //could randomly explode?
    ]
  }

  private flames: Map<Coords, FlameProps> = new Map()

  constructor (outbreak: Outbreak) {
    super(outbreak)
    // The parent constructor must be called by child to have access to child properties,
    // `this.flames` is undefined otherwise. Original implementation calling an override `boot` method can't works :(
    // See https://javascript.info/class-inheritance#overriding-class-fields-a-tricky-note

    this.outbreak.map.on(`tile:${Tile.Burning}:added`, (at: Coords, ground: Tileset) => {
      // TODO add some randomness in lifetime init
      const lifetime = FireResolver.getFlameLifetime(ground)
      //this.flames.set(at, { lifetime: random.range(Math.floor(lifetime / 2), lifetime) })
      this.flames.set(at, { lifetime })
    })
  }

  static getFlameLifetime (tiles: Tileset): number {
    // return toArray<Tile>(tiles).every(tile => tileset.has(tile))
    const flame = FireResolver.flame.lifetime.find(spread => (tiles.has(spread.for)))
    return flame?.lifetime ?? 1
  }

  resolve (): void {
    this.log.profile('fire')

    const windAngle = this.outbreak.wind.angle
    //const spreadFactor = Math.floor(100 / FireResolver.flame.lifetime.max)

    const ignitions = new Set<Coords>()
    const ashes = new Set<Coords>()
    this.flames.forEach((flame, at) => {

      const here = calculateDestination(at,
        random.range(
          windAngle - FireResolver.flame.spreadAngle,
          windAngle + FireResolver.flame.spreadAngle
        )
      )

      if (this.flameIsSpreading(here)) {
        ignitions.add(here)
      }

      flame.lifetime--
      if (flame.lifetime === 0) {
        ashes.add(at)
      }
    })

    //Apply
    let ignitionsCounter = 0
    if (ignitions.size > 0) {
      ignitions.forEach(flamingCoords => ashes.delete(flamingCoords))
      ignitionsCounter = this.outbreak.map.add(Tile.Burning, ignitions)
    }
    if (ashes.size > 0) {
      this.outbreak.map.replace(Tile.Burning, Tile.Burned, [ ...ashes ])
      ashes.forEach(at => this.flames.delete(at))
    }

    this.log.debug(`${this.flames.size} burning tiles generates ${ignitionsCounter} new ignitions`)
    this.log.profile('fire', { message: '🔥 Fire propagation resolved', level: 'debug' })
  }

  private flameIsSpreading (at: Coords): boolean {
    try {
      const ground = this.outbreak.map.get(at)
      if (ground.has(Tile.Burned)) return false

      return true
    } catch (e) {
      // Can't spreads outside the map!
    }
    return false
  }
}
