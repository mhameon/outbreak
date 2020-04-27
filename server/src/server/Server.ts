import http from 'http'
import type { AddressInfo } from 'net'
import express, { Express } from 'express'
import socketIO, { Socket } from 'socket.io'
import { logger as log } from '../service'
import GameEngine from '@engine/GameEngine'

// Todo
//  - Security: Properly check if clients are authorize to connect (see domains/origins, CORS...)
class Server {
  static maxShutdownDelayInSeconds = 5

  readonly express: Express
  private readonly http: http.Server
  private readonly io: socketIO.Server

  private readonly engine: GameEngine

  private isShuttingDown = false
  private clientCount = 0

  constructor (engine: GameEngine) {
    this.engine = engine

    this.express = express()
    this.http = http.createServer(this.express)
    this.io = socketIO(this.http)

    process.on('SIGINT', this.gracefulShutdown.bind(this))
    process.on('SIGTERM', this.gracefulShutdown.bind(this))

    process.on('uncaughtException', this.uncaughtException.bind(this))
  }

  listen (port: number): void {
    this.isShuttingDown = false

    log.silly('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -')

    this.http.listen(port, () => {
      const { address, family } = this.http.address() as AddressInfo
      log.info('🟢 Server started, awaiting connections on %s:%s (%s)', address, port, family)

      this.io.on('connect', (socket: Socket) => {
        if (this.acceptConnection()) {
          this.clientCount++
          const { 'user-agent': userAgent, host } = socket.request.headers
          log.http('Connection %s: %s, total %d client(s)', socket.id, host, this.clientCount)
          log.http('           %s: %s', socket.id, userAgent)
          // log.http('%o', socket.request.headers)
          //this.engine.createGame('test')
        } else {
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
      } else {
        this.stopNow()
      }
    }
  }

  private stopWhenClientsAreDisconnected (): void {
    const pollingFrequency = 500
    let iterationsRemaining = Server.maxShutdownDelayInSeconds * 1000 / pollingFrequency
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
      log.warn('Still %d client(s) after %ds delay, force close', this.clientCount, Server.maxShutdownDelayInSeconds)
      this.io.clients((error: Error, clients: string[]) => {
        if (error) {
          log.error(error)
        }
        clients.forEach((socketId: string) => {
          this.io.sockets.connected[socketId].disconnect(true)
        })
      })
    }

    this.http.close((failure?: Error) => {
      log.info('🔴 Server closed')
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

export default Server
