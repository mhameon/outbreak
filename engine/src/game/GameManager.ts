import { GameId } from '../@types/outbreak'
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
  private games: Map<GameId, Outbreak>

  constructor () {
    this.games = new Map()
  }

  private static buildGameId (): GameId {
    return crypto.randomBytes(12).toString('hex')
  }

  make (): GameId {
    const gameId = GameManager.buildGameId()
    const outbreak = OutbreakFactory.create(gameId)
    this.games.set(gameId, outbreak)

    return gameId
  }

  get (id: GameId): Outbreak {
    if (!this.games.has(id)) {
      throw new Error(`Game "${id}" doesn't exist`)
    }
    return this.games.get(id) as Outbreak
  }

  list (): Array<Game> {
    const list: Game[] = []
    this.games.forEach((game, gameId) => {
      list.push({
        id: gameId,
        name: game.name,
        // players: game.players,
        createdAt: game.createdAt
      })
    })
    return list
  }

  count (): number {
    return this.games.size
  }
}

export default GameManager
