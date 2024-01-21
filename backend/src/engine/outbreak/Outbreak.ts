import { Renderers } from '../renderer'
import type { GameId, GameState } from '#shared/types'
import { getLogger, Logger } from '#common/logger'
import type { Resolvable } from './resolver'
import { FireResolver, ZombieResolver } from './resolver'
import { OutbreakOptions } from './'
import { Wind } from './environment/Wind'
import { LegacyPlayer, PlayerId } from '#server/ws/GameServer'
import { EntityManager } from './entities/EntityManager'
import type { Renderable } from '#engine/renderer/MapRenderer'
import { EventEmitter } from '#common/TypedEventEmitter'
import assert from 'assert'
import { NotFoundError } from '#common/Errors'
import { WorldMap } from '#engine/map/WorldMap'
import { Serializable } from '#engine/Serializable'
import { EntityType } from '#engine/outbreak/entities/types'

export type OutbreakEvents = {
  'game:turn:resolved': { gameId: GameId; turn: number }
}

/**
 * An Outbreak represent a game
 */
export class Outbreak extends EventEmitter<OutbreakEvents> implements Serializable {
  static #renderer: Renderable

  // events
  static turn = {
    is: { resolved: 'game:turn:resolved' },
  } as const


  readonly id: GameId
  readonly log: Logger
  readonly map: WorldMap
  readonly createdAt: Date

  readonly wind: Wind
  readonly entity: EntityManager
  readonly resolvers: Array<Resolvable>

  #turn = 0 // 0 means not started
  #players = new Map<PlayerId, LegacyPlayer>()

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

  get playerCount (): number {
    return this.#players.size
  }

  resolveTurn (): number {
    this.log.profile('resolveTurn')
    this.log.info(`Resolving turn ${this.#turn}...`)

    this.resolvers.forEach(resolver => resolver.resolve())
    this.emit(Outbreak.turn.is.resolved, { gameId: this.id, turn: this.#turn })

    this.log.profile('resolveTurn', { message: `Turn ${this.#turn} resolved`, level: 'info' })
    this.#turn++

    return this.#turn
  }

  render (): string {
    return Outbreak.#renderer.render(this)
  }

  join (player: LegacyPlayer): boolean {
    if (this.#turn === 0) {
      this.entity.spawn(EntityType.Human, { x: 0, y: 0 })

      this.#players.set(player.id, player)
      return true
    }

    this.log.warn('Game has already started', { playerId: player.id })
    return false
  }

  leave (player: LegacyPlayer): boolean {
    this.#players.delete(player.id)
    return true

    //return false
  }

  /**
   * Return game state saw by the Player
   */
  serialize (playerId?: PlayerId): GameState {
    if (playerId) {
      assert(this.#players.has(playerId), new NotFoundError(playerId, 'Player'))
    }

    return {
      id: this.id,
      turn: this.currentTurn,
      size: this.map.size,
      map: this.map.serialize(playerId)
    }
  }
}
