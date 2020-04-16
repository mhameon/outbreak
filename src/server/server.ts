import http from 'http'
import { AddressInfo } from 'net'
import log from '@shared/logger'
import config from 'config'
import express, { Request, Response } from 'express'

import socketIO, { Socket } from 'socket.io'

const app = express()
const server: http.Server = http.createServer(app)
const io: socketIO.Server = socketIO(server)

// Route
app.get('/', (req: Request, res: Response) => {
  return res.json({ hello: 'world' })
})

function uncaughtException (error: Error): void {
  if (error.stack) {
    log.error(error.stack)
  }
  gracefulShutdown('SIGTERM')
}

function gracefulShutdown (signal: NodeJS.Signals): void {
  log.info(`${signal} signal received.`)

  log.debug('Closing http app...')
  server.close(() => {
    log.info('Http app closed.')
    /*
      // boolean means [force], see in mongoose doc
      mongoose.connection.close(false, () => {
        console.log('MongoDb connection closed.')
        process.exit(0)
      })
      */
    // process.exit(0)`
  })
}

export default {
  start: () => {
    log.silly('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -')
    // log.error('This is error message')
    // log.warn('This is warning message')
    // log.info('This is info message')
    // log.http('This is http message')
    // log.verbose('This is verbose message')
    // log.debug('This is debug message')
    // log.silly('This is silly 🤪 message')

    io.on('connection', (socket: Socket) => {
      log.info('a user connected')
    })

    server.listen(config.get('server.http.port'), () => {
      const addressInfo = server.address() as AddressInfo
      log.info(`Server started, listening ${addressInfo.address}:${addressInfo.port} (${addressInfo.family})...`)
    })

    process.on('uncaughtException', uncaughtException)
    process.on('SIGINT', gracefulShutdown)
    process.on('SIGTERM', gracefulShutdown)
  }
}
