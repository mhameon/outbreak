import { Tile, Tileset } from '#engine/types'
import { calculateDestination } from '#engine/math/geometry'
import type { Coords } from '#shared/types'
import { Resolver } from './Resolver'
import { random } from '#engine/math'

interface FlameProps {
  lifetime: number
}

type FlameBehavior = {
  spreadAngle: number
  lifetime: Array<{ is: number; for: Tile }>
}

export class FireResolver extends Resolver {

  static readonly flame: FlameBehavior = {
    spreadAngle: 45,
    lifetime: [
      { is: 5, for: Tile.Grass },
      { is: 6, for: Tile.Forest },
      { is: 2, for: Tile.Road },
      { is: 3, for: Tile.Building }, //could randomly explode?
      //todo `for` could be an array: allow to handle different flame lifetime depending Level of building
    ]
  }

  private flames: Map<Coords, FlameProps> = new Map()

  boot (): void {
    this.outbreak.map.on(`tile:${Tile.Burning}:added`, ({ at, originalTileset }) => {
      // TODO add some randomness in lifetime init
      const lifetime = FireResolver.getDefaultFlameLifetime(originalTileset)
      //this.flames.set(at, { lifetime: random.range(Math.floor(lifetime / 2), lifetime) })
      this.flames.set(at, { lifetime })
    })
  }

  static getDefaultFlameLifetime (tiles: Tileset): number {
    const flameLifetime = FireResolver.flame.lifetime.find(tile => tiles.has(tile.for))
    return flameLifetime?.is ?? 1
  }

  resolve (): void {
    this.log.profile('fire')

    const windAngle = this.outbreak.wind.angle
    const ignitions = new Set<Coords>()
    const ashes = new Set<Coords>()

    this.flames.forEach((flame, at) => {
      const here = calculateDestination(at, random.range(
        windAngle - FireResolver.flame.spreadAngle,
        windAngle + FireResolver.flame.spreadAngle
      ))

      if (this.flameIsSpreading(here)) {
        ignitions.add(here)
      }

      if (--flame.lifetime === 0) {
        ashes.add(at)
      }
    })

    // Fixme TemporaryBlock not always set on map (visible in Dijkstra map of ZombieResolver)
    const ignitionsCounter = this.outbreak.map.add([ Tile.Burning, Tile.TemporaryBlock ], ignitions)
    if (ashes.size > 0) {
      this.outbreak.map.replace(Tile.Burning, Tile.Burned, ashes)
      // Todo use this.outbreak.map.remove() with
      this.outbreak.map.replace(Tile.TemporaryBlock, null, ashes)
      ashes.forEach(at => this.flames.delete(at))
    }

    this.log.debug(`${this.flames.size} burning tiles (${ignitionsCounter} ignitions, ${ashes.size} ashes)`)
    this.log.profile('fire', { message: '🔥 Fire propagation resolved', level: 'debug' })
  }

  private flameIsSpreading (at: Coords): boolean {
    try {
      const ground = this.outbreak.map.get(at)

      // Flame can't propagate on already burned ground
      if (ground.has(Tile.Burned)) return false

      return random.chance(this.outbreak.wind.force * 10)
    } catch (e) {
      // Can't spread outside the map!
    }
    return false
  }
}
