import middleware from '@server/middleware'
import type { Void } from '@shared/types'
import { GameServer } from './GameServer'
import { GameManager } from '@engine/game/GameManager'


export type Plugin<T> = ((server: GameServer) => Void<T>) | Void<T>

let server: GameServer
export function initializeGameServer (): GameServer {
  if (server) {
    return server
  }

  server = new GameServer(new GameManager())
  server.express.use(middleware.router)

  return server
}
