import http from 'http'
import type { AddressInfo } from 'net'
import express, { Express } from 'express'
import * as io from 'socket.io'

import { getLogger } from '../service'
import GameManager from '@engine/game/GameManager'
import { GameId } from '@engine/@types/outbreak'

const log = getLogger('GameServer')

// Todo
//  - Security: Properly check if clients are authorize to connect (see domains/origins, CORS...)
class GameServer {
  static maxShutdownDelayInSeconds = 5

  readonly express: Express
  private readonly http: http.Server
  private readonly io: io.Server

  private readonly games: GameManager

  private isShuttingDown = false
  private clientCount = 0

  constructor (manager: GameManager) {
    this.games = manager

    this.express = express()
    this.http = http.createServer(this.express)

    this.io = new io.Server(this.http, {
      cors: {
        origin: 'http://localhost:3000', // todo handle app server url (or via config/env)
        methods: [ 'GET', 'POST' ],
        //allowedHeaders: [ 'my-custom-header' ],
        credentials: true,
      },
    })

    process.on('SIGINT', this.gracefulShutdown.bind(this))
    process.on('SIGTERM', this.gracefulShutdown.bind(this))

    process.on('uncaughtException', this.uncaughtException.bind(this))
  }

  listen (port: number): void {
    this.isShuttingDown = false

    if (this.http.listening) {
      log.warn('Server already listening')
      return
    }

    this.http.listen(port, () => {
      const { address, family } = this.http.address() as AddressInfo
      log.info('🟢 Server listening, awaiting connections on %s:%s (%s)', address, port, family)

      this.io.on('connect', (socket: io.Socket) => {
        if (this.acceptConnection()) {
          this.clientCount++
          const { 'user-agent': userAgent, origin, referer } = socket.request.headers
          log.http('Connection %s: %s, total %d client(s)', socket.id, origin ? `origin=${origin}` : `referer=${referer}`, this.clientCount)
          log.http('           %s', userAgent)

          //-- ⬇⬇ Experimental ⬇⬇ --
          let gameId: GameId
          if (this.needToCreateNewGame()) {
            gameId = this.games.make()
            log.info('Created game %s', gameId)
          }
          else {
            gameId = this.getAvailableGame()
          }

          socket.join(gameId)
          //console.log(socket.rooms) // { roomId: roomId, ... }
          log.info('Joined game %s, welcome %s', gameId, socket.id)
          this.io.to(gameId).emit('msg', 'Player %s has joined the game', socket.id)

          // ⬆⬆ Experimental ⬆⬆ --

        }
        else {
          log.http('Client refused')
          socket.disconnect(true)
        }

        socket.on('error', (error) => {
          log.error(error)
        })

        socket.on('disconnect', (reason: string) => {
          socket.disconnect(true)
          this.clientCount--
          log.http('Disconnection %s (%s), %d client(s) remains', socket.id, reason, this.clientCount)
        })
      })
    })
  }

  acceptConnection (): boolean {
    return !this.isShuttingDown
  }

  close (reason?: string): void {
    if (this.http.listening && !this.isShuttingDown) {
      this.isShuttingDown = true
      reason = reason ? `${reason} received` : 'close() called'
      log.info('Server shutdown initiated (%s)...', reason)

      if (this.clientCount > 0) {
        log.http('Emit `shutdown` to %d client(s)', this.clientCount)
        this.io.sockets.emit('shutdown')
        this.stopWhenClientsAreDisconnected()
      }
      else {
        this.stopNow()
      }
    }
  }

  private needToCreateNewGame (): boolean {
    return this.games.count() === 0
  }

  private getAvailableGame (): GameId {
    return this.games.list()[0].id
  }

  private stopWhenClientsAreDisconnected (): void {
    const pollingFrequency = 500
    let iterationsRemaining = GameServer.maxShutdownDelayInSeconds * 1000 / pollingFrequency
    const timeout = setInterval(() => {
      if (this.clientCount <= 0 || iterationsRemaining <= 0) {
        clearTimeout(timeout)
        this.stopNow()
      }
      iterationsRemaining--
    }, pollingFrequency)
  }

  private stopNow (): void {
    log.verbose('Closing server...')

    if (this.clientCount > 0) {
      log.warn('Still %d client(s) after %ds delay, force close', this.clientCount, GameServer.maxShutdownDelayInSeconds)
      // this.io.clients((error: Error, clients: string[]) => {
      //   if (error) {
      //     log.error(error)
      //   }
      //   clients.forEach((socketId: string) => {
      //     this.io.sockets.connected[socketId].disconnect(true)
      //   })
      // })
      for (const [ _, socket ] of this.io.of('/').sockets) {
        socket.disconnect(true)
      }
    }

    this.http.close((failure?: Error) => {
      log.info('🔴 Server closed')
      log.debug('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -')
      if (failure) {
        log.error(failure)
      }
    })
  }

  private uncaughtException (error: Error): void {
    log.error('⚠️ uncaughtException %s', error.stack ? error.stack : `${error.name}: ${error.message}`)
    this.close('uncaughtException')
  }

  private gracefulShutdown (signal: NodeJS.Signals): void {
    this.close(signal)
  }
}

export default GameServer
