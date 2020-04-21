import http from 'http'
import type { AddressInfo } from 'net'
import log from '@service/logger'
import express, { Express } from 'express'
import socketIO, { Socket } from 'socket.io'

class Server {
  private readonly app: Express
  private readonly http: http.Server
  private readonly io: socketIO.Server

  private shutdownDelayInSeconds = 3
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

  public listen (port: number): void {
    this.isShuttingDown = false

    log.silly('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -')
    this.http.listen(port, () => {
      const addressInfo = this.http.address() as AddressInfo
      log.info(
        '🟢 Server started, listening %s:%s (%s)',
        addressInfo.address,
        addressInfo.port,
        addressInfo.family
      )
    })

    this.io.on('connection', (socket: Socket) => {
      if (!this.isShuttingDown) {
        this.clientCount++
        log.http('Connection %s, total %d client(s)', socket.id, this.clientCount)
      } else {
        log.http('Client refused')
        socket.disconnect(true)
      }

      socket.on('disconnect', (reason: string) => {
        socket.disconnect(true)
        this.clientCount--
        log.http('Disconnection %s (%s), %d client(s) remains', socket.id, reason, this.clientCount)
      })
    })
  }

  public close (reason?: string) {
    if (!this.isShuttingDown) {
      this.isShuttingDown = true
      reason = reason ? `${reason} received` : 'close() called'
      log.info('Server shutdown initiated (%s)...', reason)

      if (this.clientCount <= 0) {
        this.stop()
      } else {
        log.verbose('Emit `shutdown` to %d client(s), server will close in %ds', this.clientCount, this.shutdownDelayInSeconds)
        this.io.sockets.emit('shutdown')
        this.delayedStop()
      }
    }
  }

  public getExpressApp (): Express {
    return this.app
  }

  private delayedStop () {
    let shutdownCountdown = this.shutdownDelayInSeconds
    const timeout = setInterval(() => {
      log.verbose('%d...', shutdownCountdown--)
      if (shutdownCountdown <= 0) {
        clearTimeout(timeout)
        this.stop()
      }
    }, 1000)
  }

  private stop () {
    this.http.close((failure?: Error) => {
      log.info('🔴 Server exited')
      if (failure) {
        log.error('%o', failure)
        process.exit(1)
      }
      // process.exit(0)
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
