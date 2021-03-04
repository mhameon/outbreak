import WorldMap from '../map/WorldMap'
import { Renderers } from '../renderer'
import { GameId, Tile, Coords } from '../types'
import { calculateDestination } from '@engine/math/geometry'

export class Outbreak {
  private static renderer = new Renderers.Ascii()

  readonly id: GameId
  readonly createdAt: Date
  readonly map: WorldMap
  private turn = 0 // 0 means not started

  wind: { angle: number }

  private players = new Map()

  constructor (id: GameId, map: WorldMap) {
    this.id = id
    this.map = map
    this.createdAt = new Date()

    this.wind = { angle: 110 }
  }

  get name (): string {
    return this.map.name
  }

  get currentTurn (): number {
    return this.turn
  }

  resolveTurn (): number {

    let burningTiles = 0
    const ignitions = new Set<Coords>()
    const ashes = new Set<Coords>()
    this.map.each(({ tileset, at }) => {
      if (tileset.has(Tile.Burning)) {
        burningTiles++

        //if (random.chance(75)) {
        const destination = calculateDestination(at, this.wind.angle, 1)
        ignitions.add(destination)
        //}

        //if ( random.chance(50) ) {
        ashes.add(at)
        //}
      }
    })

    if (ignitions.size > 0) {
      ignitions.forEach(flamingCoords => ashes.delete(flamingCoords))
      this.map.add(Tile.Burning, [ ...ignitions ])
    }
    if (ashes.size > 0) {
      this.map.replace(Tile.Burning, Tile.Burned, [ ...ashes ])
    }

    console.log(`${burningTiles} burning tiles generate ${ignitions.size} new ignitions`)

    return ++this.turn
  }

  render (): string {
    const windRose = [ '↑', '↗', '→', '↘', '↓', '↙', '←', '↖' ]
    let direction = Math.floor(this.wind.angle / 45) + (this.wind.angle % 45 >= 22.5 ? 1 : 0)
    direction = direction >= 8 ? 0 : direction

    return ''
      + `Outbreak: ${this.id} (${this.createdAt.toISOString()})\n`
      + `Wind    : ${this.wind.angle}° ${windRose[direction]}\n`
      + `Turn    : ${this.turn || 'Not started'}\n`
      + `${Outbreak.renderer.render(this.map)}`
    // + `\n${Outbreak.renderer.render(this.map.extract({ x: 2, y: 2 }, { width: 5, height: 5 }))}`
  }

  joinPlayer (player: any): void {
    if (this.turn === 0) {
      this.players.set(player.id, player)
    } else {
      // Game is already started
    }
  }
}
