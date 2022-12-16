import { staticRoutes, apiRoutes, session, cors } from '#server/middleware'
import type { Void } from '#common/types'
import { GameServer } from './GameServer'
import { GameManager } from '#engine/game/GameManager'
import type { Express } from 'express'
import express from 'express'

export type Plugin<T> = ((server: GameServer) => Void<T>) | Void<T>

let server: GameServer

export function createGameServer (): GameServer {
  if (server) {
    return server
  }

  const app: Express = express()
  app
    .set('trust proxy', 1) // fixme trust first proxy, don't keep like that in prod
    .use(cors)
    .use(express.json())
    .use(session)
    .use(staticRoutes)
    .use('/api', apiRoutes)

  server = new GameServer(
    { app, session },
    new GameManager()
  )


  return server
}
