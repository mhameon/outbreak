import { NotFoundError } from '#shared/Errors'
import { GameId } from '../types'
// Fixme IoD: use interfaces & inject them in constructor
import { Outbreak, OutbreakFactory } from '../outbreak/'
import crypto from 'crypto'
import { event } from '#engine/events'

import { getLogger } from '#shared/logger/index'
import { EventEmitter } from 'events'

const log = getLogger('GameManager')

type Game = {
  id: GameId
  name: string
  // players: any[]
  turn: number
}

/**
 * Handle & Manage games (Outbreak)
 *
 * Emitted event:
 * | Name           | Handler signature |
 * |----------------|-------------------|
 * | `game:deleted` | (gameId: GameId)  |
 */
export class GameManager extends EventEmitter {
  static GAME_ID_PREFIX = 'game:'

  private readonly games: Map<GameId, Outbreak> = new Map()

  private static buildGameId (): GameId {
    return `${GameManager.GAME_ID_PREFIX}${crypto.randomBytes(12).toString('hex')}`
  }

  create (id?: GameId): GameId {
    log.verbose('Creating outbreak...')
    const gameId = id ?? GameManager.buildGameId()
    const outbreak = OutbreakFactory.create(gameId)
    this.games.set(gameId, outbreak)

    return gameId
  }

  has (gameId: GameId): boolean {
    return this.games.has(gameId)
  }

  /**
   * @throws {NotFoundError}
   */
  get (gameId: GameId): Outbreak {
    if (!this.has(gameId)) {
      throw new NotFoundError(gameId, 'GameId', log.error)
    }
    return this.games.get(gameId) as Outbreak
  }

  /**
   * @throws {NotFoundError}
   */
  delete (gameId: GameId): void {
    this.get(gameId)
    this.games.delete(gameId)
    this.emit(event.game.deleted, gameId)
    log.info('Deleted `%s`', gameId, { gameId })
  }

  list (): Array<Game> {
    const list: Game[] = []
    this.games.forEach((game, gameId) => {
      list.push({
        id: gameId,
        name: game.name,
        // players: game.players,
        turn: game.currentTurn,
      })
    })
    return list
  }

  count (): number {
    return this.games.size
  }
}
