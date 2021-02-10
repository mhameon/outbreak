import { NotFoundError } from '@shared/Errors'
import { GameId } from '../type/outbreak'
import { Outbreak , OutbreakFactory } from '../outbreak/'
import crypto from 'crypto'

import { getLogger } from '@shared/logger'

const log = getLogger('GameManager')

type Game = {
  id: GameId
  name: string
  // players: any[]
  createdAt: Date
}

export class GameManager {
  static GAME_ID_PREFIX = 'game:'

  private readonly games: Map<GameId, Outbreak> = new Map()

  private static buildGameId (): GameId {
    return `${GameManager.GAME_ID_PREFIX}${crypto.randomBytes(12).toString('hex')}`
  }

  create (): GameId {
    const gameId = GameManager.buildGameId()
    const outbreak = OutbreakFactory.create(gameId)
    this.games.set(gameId, outbreak)
    log.info('Created `%s`', gameId, { gameId })
    return gameId
  }

  has (gameId: GameId): boolean {
    return this.games.has(gameId)
  }

  get (gameId: GameId): Outbreak {
    if (!this.has(gameId)) {
      throw new NotFoundError(gameId, 'GameId', log.error)
    }
    return this.games.get(gameId) as Outbreak
  }

  delete (gameId: GameId): void {
    this.get(gameId)
    this.games.delete(gameId)
    log.info('Deleted `%s`', gameId, { gameId })
  }

  list (): Array<Game> {
    const list: Game[] = []
    this.games.forEach((game, gameId) => {
      list.push({
        id: gameId,
        name: game.name,
        // players: game.players,
        createdAt: game.createdAt,
      })
    })
    return list
  }

  count (): number {
    return this.games.size
  }
}
