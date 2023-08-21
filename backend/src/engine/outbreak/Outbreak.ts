import { Renderers } from '../renderer'
import type { GameId, GameState } from '#shared/types'
import { getLogger, Logger } from '#common/logger'
import type { Resolvable } from './resolver'
import { FireResolver, ZombieResolver } from './resolver'
import { OutbreakOptions } from './'
import { Wind } from './environment/Wind'
import { Player, PlayerId } from '#server/service/server/GameServer'
import { EntityManager } from './entities/EntityManager'
import type { Renderable } from '#engine/renderer/MapRenderer'
import { EventEmitter } from '#common/TypedEventEmitter'
import { OutbreakEvents } from '#engine/events'
import assert from 'assert'
import { NotFoundError } from '#common/Errors'
import { WorldMap } from '#engine/map/WorldMap'

/**
 * An Outbreak represent a game
 *
 * Emitted events:
 * | Name                 | Handler signature                  |
 * |----------------------|------------------------------------|
 * | `game:turn:resolved` | ({ gameId: GameId, turn: number }) |
 */
export class Outbreak extends EventEmitter<OutbreakEvents> {
  static #renderer: Renderable

  readonly id: GameId
  readonly log: Logger
  readonly map: WorldMap
  readonly createdAt: Date

  readonly wind: Wind
  readonly entity: EntityManager
  readonly resolvers: Array<Resolvable>

  #turn = 0 // 0 means not started
  #players = new Map<PlayerId, Player>()

  constructor (id: GameId, map: WorldMap, option?: OutbreakOptions) {
    super()
    Outbreak.#renderer = Renderers.Ascii()
    this.id = id
    this.log = getLogger('Outbreak', { gameId: this.id })
    this.map = map
    this.createdAt = new Date()

    this.wind = new Wind(option?.wind)
    this.entity = new EntityManager(this)

    this.resolvers = [
      new FireResolver(this),
      new ZombieResolver(this)
    ]
  }

  get name (): string {
    return this.map.name
  }

  get currentTurn (): number {
    return this.#turn
  }

  resolveTurn (): number {
    this.log.profile('resolveTurn')
    this.log.debug(`Resolving turn ${this.#turn}...`)

    this.resolvers.forEach(resolver => resolver.resolve())
    this.emit('game:turn:resolved', { gameId: this.id, turn: this.#turn })

    this.log.profile('resolveTurn', { message: `Turn ${this.#turn} resolved`, level: 'info' })
    this.#turn++

    return this.#turn
  }

  render (): string {
    return Outbreak.#renderer.render(this)
  }

  joinPlayer (player: Player): boolean {
    if (this.#turn === 0) {
      this.#players.set(player.id, player)
      return true
    }

    this.log.warn('Game is already started', { playerId: player.id })
    return false
  }

  /**
   * Return game state saw by the Player
   */
  getGameState (playerId: PlayerId): GameState {
    assert(this.#players.has(playerId), new NotFoundError(playerId, 'Player'))

    // Todo create a gameStateBuilder to build the structure (+share things with clients to allow easier handle)

    return { turn: this.currentTurn, size: this.map.size }
  }
}
