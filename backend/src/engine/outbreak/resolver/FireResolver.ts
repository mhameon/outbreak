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
      { is: 5, for: Tile.Grass }, //burn longer
      { is: 6, for: Tile.Forest },
      { is: 2, for: Tile.Road },
      { is: 3, for: Tile.Building }, //could randomly explode?
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
    const flameLifetime = FireResolver.flame.lifetime.find(tile => (tiles.has(tile.for)))
    return flameLifetime?.is ?? 1
  }

  resolve (): void {
    this.log.profile('fire')

    const ignitions = new Set<Coords>()
    const ashes = new Set<Coords>()
    const windAngle = this.outbreak.wind.angle

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

    const ignitionsCounter = this.outbreak.map.add(Tile.Burning, ignitions)
    if (ashes.size > 0) {
      this.outbreak.map.replace(Tile.Burning, Tile.Burned, ashes)
      ashes.forEach(at => this.flames.delete(at))
    }

    this.log.debug(`${this.flames.size} burning tiles generates ${ignitionsCounter} new ignitions`)
    this.log.profile('fire', { message: '🔥 Fire propagation resolved', level: 'debug' })
  }

  private flameIsSpreading (at: Coords): boolean {
    try {
      const ground = this.outbreak.map.get(at)

      // Flame can't propagate on already burned ground
      if (ground.has(Tile.Burned)) return false

      return random.chance(this.outbreak.wind.force * 10)
    } catch (e) {
      // Can't spreads outside the map!
    }
    return false
  }
}
