import WorldMap from '../map/WorldMap'
import { Renderers } from '../renderer'
import { GameId } from '../types'
import { getLogger, Logger } from '@shared/logger'
import { FireResolver, Resolvable } from './resolver'

export class Outbreak {
  private static renderer = new Renderers.Ascii()

  readonly log: Logger
  readonly id: GameId
  readonly createdAt: Date
  readonly map: WorldMap
  readonly resolvers: Array<Resolvable>
  private turn = 0 // 0 means not started

  wind: { angle: number }

  private players = new Map()

  constructor (id: GameId, map: WorldMap) {
    this.id = id
    this.map = map
    this.createdAt = new Date()

    this.wind = { angle: 45 }

    this.log = getLogger('Outbreak', { gameId: this.id })

    this.resolvers = [
      new FireResolver(this)
    ]
  }

  get name (): string {
    return this.map.name
  }

  get currentTurn (): number {
    return this.turn
  }

  resolveTurn (): number {
    this.log.profile('resolveTurn')
    this.log.debug(`Resolving turn ${this.turn}...`)

    this.resolvers.forEach(resolver => resolver.resolve())

    // this.log.profile('sound')
    // this.log.profile('sound', { message: '🔊 Resolve: Sound propagation', level: 'debug' })
    // this.log.profile('zombie')
    // this.log.profile('zombie', { message: '🧟 Resolve: Zombies move', level: 'debug' })

    this.log.profile('resolveTurn', { message: `Turn ${this.turn} resolved`, level: 'info' })
    return ++this.turn
  }

  render (): string {
    const windRose = [ '↑', '↗', '→', '↘', '↓', '↙', '←', '↖' ]
    const negativeAngle = this.wind.angle < 0
    let direction = Math.floor(Math.abs(this.wind.angle) / 45) + (Math.abs(this.wind.angle) % 45 >= 22.5 ? 1 : 0)
    direction = direction >= 8 ? 0 : direction

    return ''
      + `Outbreak: ${this.id} (${this.createdAt.toISOString()})\n`
      + `Wind    : ${this.wind.angle}° ${windRose[negativeAngle ? 8 - direction : direction]}\n`
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
