import http from 'http'
import { AddressInfo } from 'net'
import log from '@service/logger'
import config from 'config'
import express from 'express'
import socketIO, { Socket } from 'socket.io'
import middleware from '../middleware'

const shutdownDelayInSeconds = 3
let isShuttingDown = false
let clientCount = 0

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

middleware.addRoutes(app)

process.on('uncaughtException', uncaughtException)

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)

function start () {
  isShuttingDown = false
  log.silly('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -')
  // log.error('This is error message')
  // log.warn('This is warning message')
  // log.info('This is info message')
  // log.http('This is http message')
  // log.verbose('This is verbose message')
  // log.debug('This is debug message')
  // log.silly('This is silly 🤪 message')

  server.listen(config.get('server.port'), () => {
    const addressInfo = server.address() as AddressInfo
    log.info(
      '🟢 Server started, listening %s:%s (%s)',
      addressInfo.address,
      addressInfo.port,
      addressInfo.family
    )
  })

  io.on('connection', (socket: Socket) => {
    log.http('Connection %s, total %d client(s)', socket.id, ++clientCount)

    socket.on('disconnect', (reason: string) => {
      socket.disconnect(true)
      log.http('Disconnection %s (%s), %d client(s) left', socket.id, reason, --clientCount)
    })
  })
}

function uncaughtException (error: Error): void {
  log.error('⚠️ uncaughtException %s', error.stack ? error.stack : `${error.name}: ${error.message}`)
  gracefulShutdown('SIGTERM')
}

function gracefulShutdown (signal: NodeJS.Signals): void {
  if (!isShuttingDown) {
    isShuttingDown = true
    log.info('Server shutdown initiated (%s received)...', signal)

    if (clientCount > 0) {
      log.verbose('Emit `shutdown` to %d client(s), server will close in %ds', clientCount, shutdownDelayInSeconds)
      io.sockets.emit('shutdown')
      delayedStop(shutdownDelayInSeconds)
    } else {
      stop()
    }
  }
}

function delayedStop (seconds: number) {
  let shutdownCountdown = seconds
  const timeout = setInterval(() => {
    log.verbose('%d...', shutdownCountdown--)
    if (shutdownCountdown <= 0) {
      clearTimeout(timeout)
      stop()
    }
  }, 1000)
}

function stop () {
  server.close((err?: Error) => {
    log.info('🔴 Server exited')
    if (err) {
      log.error('%o', err)
      process.exit(1)
    }
    process.exit(0)
  })
}

export default {
  start
}
