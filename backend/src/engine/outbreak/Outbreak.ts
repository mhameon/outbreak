import WorldMap from '../map/WorldMap'
import { Renderers } from '../renderer'
import { GameId } from '../types'
import { getLogger, Logger } from '@shared/logger'
import { FireResolver, Resolvable } from './resolver'
import { Options } from './'
import { Wind } from '@engine/outbreak/environment/Wind'
import { Player } from '@server/service/server/GameServer'

export class Outbreak {
  private static renderer = new Renderers.Ascii()

  readonly log: Logger
  readonly id: GameId
  readonly createdAt: Date
  readonly map: WorldMap

  readonly wind: Wind
  readonly resolvers: Array<Resolvable>

  private turn = 0 // 0 means not started
  private players = new Map()

  constructor (id: GameId, map: WorldMap, option?: Options) {
    this.id = id
    this.map = map
    this.createdAt = new Date()

    this.log = getLogger('Outbreak', { gameId: this.id })

    this.wind = new Wind(option?.wind)

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
    const windForce = (''.padEnd(this.wind.force, '◼')) + (''.padEnd(Wind.maxForce - this.wind.force, '◻'))
    const windRose = [ '↑', '↗', '→', '↘', '↓', '↙', '←', '↖' ]
    const negativeAngle = this.wind.angle < 0
    let direction = Math.floor(Math.abs(this.wind.angle) / 45) + (Math.abs(this.wind.angle) % 45 >= 22.5 ? 1 : 0)
    direction = direction >= 8 ? 0 : direction

    return ''
      + `Outbreak: ${this.id} (${this.createdAt.toISOString()})\n`
      + `Wind    : ${windRose[negativeAngle ? 8 - direction : direction]} ${this.wind.angle}° ${windForce} Force ${this.wind.force}\n`
      + `Turn    : ${this.turn || 'Not started'}\n`
      + `${Outbreak.renderer.render(this.map)}`
    // + `\n${Outbreak.renderer.render(this.map.extract({ x: 2, y: 2 }, { width: 5, height: 5 }))}`
  }

  joinPlayer (player: Player): void {
    if (this.turn === 0) {
      this.players.set(player.id, player)
    } else {
      // Game is already started
    }
  }
}
