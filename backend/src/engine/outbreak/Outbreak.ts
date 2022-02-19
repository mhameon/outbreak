import { WorldMap } from '../map/WorldMap'
import { Renderers } from '../renderer'
import { GameId } from '../types'
import { getLogger, Logger } from '#shared/logger/index'
import { FireResolver } from './resolver'
import type { Resolvable } from './resolver'
import { Options } from './'
import { Wind } from '#engine/outbreak/environment/Wind'
import { Player } from '#server/service/server/GameServer'
import { CreatureManager } from '#engine/outbreak/entities/CreatureManager'
import type { Renderable } from '#engine/renderer/MapRenderer'

export class Outbreak {
  //private static renderer = Renderers.Ascii()
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

  constructor(id: GameId, map: WorldMap, option?: Options) {
    Outbreak.renderer = Renderers.Ascii()
    this.id = id
    this.log = getLogger('Outbreak', { gameId: this.id })
    this.map = map
    this.createdAt = new Date()

    this.wind = new Wind(option?.wind)
    this.creature = new CreatureManager(this)

    this.resolvers = [
      new FireResolver(this),
    ]
  }

  get name(): string {
    return this.map.name
  }

  get currentTurn(): number {
    return this.turn
  }

  resolveTurn(): number {
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

  render(): string {
    return Outbreak.renderer.render(this)

    // const seeder = this.map.seeder ? `build with ${this.map.seeder.builder}(${this.map.seeder.seed})` : ''
    // const windForce = (''.padEnd(this.wind.force, '◼')) + (''.padEnd(Wind.maxForce - this.wind.force, '◻'))
    //
    // return ''
    //   + `Outbreak: ${this.id} (${this.createdAt.toISOString()})\n`
    //   + `Map     : "${this.map.name}" (${this.map.size.width}x${this.map.size.height}) ${seeder}\n`
    //   + `Wind    : ${this.wind.arrow} ${this.wind.angle}° ${windForce} Force ${this.wind.force}\n`
    //   + `Turn    : ${this.turn || 'Not started'}\n`
    //   + `${Outbreak.renderer.render(this)}`
    // + `\n${Outbreak.renderer.render(this.map.extract({ x: 2, y: 2 }, { width: 5, height: 5 }))}`
  }

  joinPlayer(player: Player): void {
    if (this.turn === 0) {
      this.players.set(player.id, player)
    } else {
      // Game is already started
    }
  }
}
