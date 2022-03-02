import { WorldMap } from '../map/WorldMap'
import { Renderers } from '../renderer'
import { GameId } from '../types'
import { getLogger, Logger } from '#shared/logger/index'
import { FireResolver, ZombieResolver } from './resolver'
import type { Resolvable } from './resolver'
import { OutbreakOptions } from './'
import { Wind } from './environment/Wind'
import { Player } from '#server/service/server/GameServer'
import { CreatureManager } from './entities/CreatureManager'
import type { Renderable } from '#engine/renderer/MapRenderer'

export class Outbreak {
  private static renderer: Renderable

  readonly id: GameId
  readonly log: Logger
  readonly map: WorldMap
  readonly createdAt: Date

  readonly wind: Wind
  readonly creature: CreatureManager
  readonly resolvers: Array<Resolvable>

  private turn = 0 // 0 means not started
  private players = new Map()

  constructor (id: GameId, map: WorldMap, option?: OutbreakOptions) {
    Outbreak.renderer = Renderers.Ascii()
    this.id = id
    this.log = getLogger('Outbreak', { gameId: this.id })
    this.map = map
    this.createdAt = new Date()

    this.wind = new Wind(option?.wind)
    this.creature = new CreatureManager(this)

    this.resolvers = [
      new FireResolver(this),
      new ZombieResolver(this)
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

    this.log.profile('resolveTurn', { message: `Turn ${this.turn} resolved`, level: 'info' })
    return ++this.turn
  }

  render (): string {
    return Outbreak.renderer.render(this)
  }

  joinPlayer (player: Player): void {
    if (this.turn === 0) {
      this.players.set(player.id, player)
    } else {
      // Game is already started
    }
  }
}
