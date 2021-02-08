import middleware from '@server/middleware'
import { GameServer } from './GameServer'
import { GameManager } from '@engine/game/GameManager'

let server: GameServer

export type Plugin<T> = T | void | ((server: GameServer) => Plugin<T>)

export function initializeGameServer (): GameServer {
  if (server) {
    return server
  }

  server = new GameServer(new GameManager())
  server.express.use(middleware.router)

  return server
}
