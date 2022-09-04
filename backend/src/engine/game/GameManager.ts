import { NotFoundError } from '#shared/Errors'
import { GameId } from '../types'
import { Outbreak, OutbreakFactory } from '../outbreak/'
import crypto from 'crypto'
import { getLogger } from '#shared/logger/index'
import { EventEmitter } from '#shared/TypedEventEmitter'
import { GameManagerEvents } from '#engine/events'

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
 * Emitted events:
 * | Name           | Handler signature    |
 * |----------------|----------------------|
 * | `game:created` | (outbreak: Outbreak) |
 * | `game:deleted` | (gameId: GameId)     |
 */
export class GameManager extends EventEmitter<GameManagerEvents> {
  static GAME_ID_PREFIX = 'game_' as const

  private readonly games: Map<GameId, Outbreak> = new Map()

  private static buildGameId (): GameId {
    return `${GameManager.GAME_ID_PREFIX}${crypto.randomBytes(12).toString('hex')}`
  }

  create (id?: GameId): GameId {
    log.verbose('Creating outbreak...')
    const gameId = id ?? GameManager.buildGameId()
    const outbreak = OutbreakFactory.create(gameId)
    this.games.set(gameId, outbreak)
    this.emit('game:created', outbreak)
    return gameId
  }

  has (gameId: GameId): boolean {
    return this.games.has(gameId)
  }

  /**
   * @throws {NotFoundError}
   */
  get (gameId: GameId): Outbreak {
    const outbreak = this.games.get(gameId)
    if (!outbreak) {
      throw new NotFoundError(gameId, 'GameId', log.error)
    }
    return outbreak
  }

  /**
   * @throws {NotFoundError}
   */
  delete (gameId: GameId): void {
    this.get(gameId)
    this.games.delete(gameId)
    this.emit('game:deleted', gameId)
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
