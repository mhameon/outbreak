import { GameId } from '../@types/outbreak'
import { NotFoundError } from '../map/MapErrors'
import Outbreak from '../outbreak/Outbreak'
import crypto from 'crypto'
import OutbreakFactory from '../outbreak/OutbreakFactory'

type Game = {
  id: GameId
  name: string
  // players: any[]
  createdAt: Date
}

class GameManager {
  static GAMEID_PREFIX = 'game:'

  private readonly games: Map<GameId, Outbreak> = new Map()

  private static buildGameId (): GameId {
    return `${GameManager.GAMEID_PREFIX}${crypto.randomBytes(12).toString('hex')}`
  }

  create (): GameId {
    const gameId = GameManager.buildGameId()
    const outbreak = OutbreakFactory.create(gameId)
    this.games.set(gameId, outbreak)

    return gameId
  }

  get (id: GameId): Outbreak {
    if (!this.games.has(id)) {
      throw new NotFoundError(id, 'GameId')
    }
    return this.games.get(id) as Outbreak
  }

  delete (id: GameId): void {
    this.get(id)
    this.games.delete(id)
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

export default GameManager
