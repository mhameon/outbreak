import { staticRoutes, apiRoutes, session } from '#server/middleware'
import type { Void } from '#common/types'
import { GameServer } from './GameServer'
import { GameManager } from '#engine/game/GameManager'
import cors from 'cors'
import config from 'config'
import type { Express } from 'express'
import express from 'express'

export type Plugin<T> = ((server: GameServer) => Void<T>) | Void<T>

let server: GameServer

export function createGameServer (): GameServer {
  if (server) {
    return server
  }

  const app: Express = express()
  // FIXME proxy & CORS & Session storage & Security stuff
  app
    .set('trust proxy', 1) // trust first proxy
    .use(cors({
      credentials: true,
      origin: (origin, callback) => { // allow requests with no origin
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true)

        if ([ config.server.http.host ].indexOf(origin) === -1) {
          const message = 'The CORS policy for this site does not allow access from the specified Origin.'
          return callback(new Error(message), false)
        }
        return callback(null, true)
      }
    }))
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
