import { router } from '#server/http/middleware/router'
import { session, cors, clientErrorHandler, errorHandler } from '#server/http/middleware'
import { GameServer } from '#server/ws/GameServer'
import { GameManager } from '#engine/game/GameManager'
import express from 'express'
import { RuntimeError } from '#common/Errors'

let server: GameServer

export function getGameServer (): GameServer {
  if (!server) {
    throw new RuntimeError('GameServer doesn\'t seems to exist, call createGameServer() first')
  }
  return server
}

export function createGameServer (): GameServer {
  if (server) {
    return server
  }

  const app = express()
    .disable('x-powered-by')
    .set('trust proxy', 1) // TODO uncomment if behind a proxy (NGINX handling HTTPS for example)
    .use(cors)
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use(session)
    .use(router)
    .use(clientErrorHandler)
    .use(errorHandler)

  server = new GameServer(
    { app, session },
    new GameManager()
  )

  return server
}
