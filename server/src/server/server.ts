import http from 'http'
import type { AddressInfo } from 'net'
import log from '@service/logger'
import express, { Express } from 'express'
import socketIO, { Socket } from 'socket.io'

class Server {
  static maxShutdownDelayInSeconds = 5

  private readonly app: Express
  private readonly http: http.Server
  private readonly io: socketIO.Server

  private isShuttingDown = false
  private clientCount = 0

  public constructor () {
    this.app = express()
    this.http = http.createServer(this.app)
    this.io = socketIO(this.http)

    process.on('uncaughtException', this.uncaughtException.bind(this))

    process.on('SIGINT', this.gracefulShutdown.bind(this))
    process.on('SIGTERM', this.gracefulShutdown.bind(this))
  }

  get express (): Express {
    return this.app
  }

  public listen (port: number): void {
    this.isShuttingDown = false

    log.silly('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -')

    this.http.listen(port, () => {
      const { address, family } = this.http.address() as AddressInfo
      log.info('🟢 Server started, listening %s:%s (%s)', address, port, family)

      this.io.on('connection', (socket: Socket) => {
        if (this.acceptConnection()) {
          this.clientCount++
          log.http('Connection %s, total %d client(s)', socket.id, this.clientCount)
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

  public acceptConnection (): boolean {
    return !this.isShuttingDown
  }

  public close (reason?: string): void {
    if (!this.isShuttingDown) {
      this.isShuttingDown = true
      reason = reason ? `${reason} received` : 'close() called'
      log.info('Server shutdown initiated (%s)...', reason)

      if (this.clientCount > 0) {
        log.verbose('Emit `shutdown` to %d client(s)', this.clientCount)
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
