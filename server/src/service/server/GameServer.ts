import assert from 'assert'
import http from 'http'
import type { AddressInfo } from 'net'
import express, { Express } from 'express'
import * as io from 'socket.io'
import * as util from 'util'
import { getLogger } from '../logger'
import GameManager from '@engine/game/GameManager'
import { GameId } from '@engine/@types/outbreak'
import { server } from './index'
import { ConnectionRefusedError } from './ServerErrors'

// Fixme: must be typed and lives in another file
type Player = any

const log = getLogger('GameServer')
const LOBBY = 'lobby'

// Todo
//  - Security: Properly check if clients are authorize to connect (see domains/origins, CORS...)
export class GameServer {
  static maxShutdownDelayInSeconds = 5

  readonly express: Express
  private readonly http: http.Server
  private readonly io: io.Server

  private readonly game: GameManager
  private readonly rooms = new Set<string>()
  private readonly clients = new WeakMap<io.Socket, Player>()

  private isShuttingDown = false
  private startListeningAt?: Date

  constructor (manager: GameManager) {
    this.game = manager

    this.express = express()
    this.http = http.createServer(this.express)
    this.io = new io.Server(this.http, {
      cors: {
        origin: [ // todo handle app server url (or via config/env)
          'http://localhost:3000',
          'http://172.18.41.139:3000',
        ],
        methods: [ 'GET', 'POST' ],
        //allowedHeaders: [ 'my-custom-header' ],
        credentials: true,
      },
    })

    this.registerMiddlewares()
    // room middleware seems to work
    // this.io.in(LOBBY).use((socket, next) => {
    //   log.debug('lobby')
    //   next()
    // })
    this.io.on('connect', (socket: io.Socket) => {
      const { 'user-agent': userAgent } = socket.request.headers
      log.http(
        '🟢 Here come a new challenger! Total %d client(s)', this.connectedClientCounter,
        { socket_id: socket.id, user_agent: userAgent },
      )

      socket.join(LOBBY)
      this.rooms.add(LOBBY)

      this.registerDisconnectionHandler(socket)
      this.registerErrorHandler(socket)
      this.registerEventLogger(socket) //todo idea: is it possible to log response if callback?


      socket.on('game:join', ({ id: GameId } = {}, response: (data: { gameId: GameId }) => void) => {
        // Middleware for 'game:join' event. Error "catch" in socket.on('error', (err) => {}) handler
        // socket.use(([ event, ...args ], next) => {
        //   const game = [ ...socket.rooms ].find(r => r.startsWith(GameManager.GAMEID_PREFIX))
        //   if (game) {
        //     socket.emit('msg', `Already in ${game}`)
        //     // //response({ gameId: game })
        //     // return
        //     next(new ConnectionRefusedError(`Already in ${game}`))
        //   }
        // })

        // Act like middleware, but simpler
        let gameId = [ ...socket.rooms ].find(room => room.startsWith(GameManager.GAMEID_PREFIX))
        if (gameId) {
          log.warn('Already in %s', gameId)
          socket.emit('msg', `Already in ${gameId}`)
          return
        }
        // if (id) {
        //   log.silly('todo try to join %s room', id)
        // }
        // else {
        //   // todo: game:enter in available game or create new one
        //   id = 'new game id'
        // }

        if (this.needToCreateNewGame()) {
          gameId = this.game.create()
          log.info('Created %s', gameId)
        }
        else {
          gameId = this.getAvailableGame()
        }
        socket.leave(LOBBY)
        socket.join(gameId)
        this.rooms.add(gameId)
        log.info('Player just joined %s', gameId, { socket_id: socket.id, game_id: gameId })
        socket.to(gameId).emit('msg', `Player ${socket.id} has joined the game`)
        socket.emit('msg', `You joined the game, ${socket.id}`)

        response({ gameId })
      })
    })

    process.on('SIGINT', this.gracefulShutdown.bind(this))
    process.on('SIGTERM', this.gracefulShutdown.bind(this))
    process.on('uncaughtException', this.uncaughtException.bind(this))
  }

  listen (port: number): void {
    this.isShuttingDown = false
    if (this.http.listening) {
      log.warn('Server is already listening')
      return
    }

    this.http.listen(port, () => {
      this.startListeningAt = new Date()
      const { address } = this.http.address() as AddressInfo
      log.info('🟩 Server listening, awaiting connections on %s:%s', address === '::' ? 'localhost' : address, port)
      log.silly('─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─')
    })
  }

  close (reason?: string): void {
    if (this.http.listening && !this.isShuttingDown) {
      this.isShuttingDown = true
      reason = reason ? `${reason} received` : 'close() called'
      log.info('Server shutdown initiated (%s)...', reason)

      if (this.connectedClientCounter === 0) {
        this.stopNow()
        return
      }
      log.http('Emit `shutdown` to %d client(s)', this.connectedClientCounter)
      console.table(server.status.clients, [ 'id', 'rooms' ])

      // this.io.sockets.emit or this.io.emit don't alaways emit (if join before)
      //this.io.sockets.emit('shutdown')
      this.io.emit('shutdown')

      // Works
      // for (const [ id, socket ] of this.io.sockets.sockets) {
      //   socket.emit('shutdown')
      // }
      this.stopWhenClientsAreDisconnected()
    }
  }

  get connectedClientCounter (): number {
    return this.io.sockets.sockets.size
  }

  // Fixme define status type
  get status (): any {
    const clients = []
    for (const [ id, socket ] of this.io.sockets.sockets) {
      clients.push({
        id, rooms: [ ...socket.rooms ].filter(r => r !== id),
      })
    }

    const uptime = this.http.listening && this.startListeningAt ? (+new Date() - +this.startListeningAt) / 1000 : 0

    return {
      started: this.http.listening,
      uptime: +uptime.toFixed(3),
      rooms: this.rooms.values(),
      clients,
    }
  }

  private registerMiddlewares (): void {
    this.io.use((socket, next) => {
      if (this.isShuttingDown) {
        next(new ConnectionRefusedError('Server is shutting down', log.info))
      }
      next()
    })

    this.io.use((socket, next) => {
      // Todo Check authentication & get user information
      const authenticated = true
      if (!authenticated) {
        next(new ConnectionRefusedError('Unauthenticated user', log.error))
      }

      this.clients.set(socket, {
        socketId: socket.id,
        connectedAt: new Date(),
      })

      next()
    })
  }

  private registerDisconnectionHandler (socket: io.Socket): void {
    socket
      .on('disconnecting', (reason) => {
        const gameRooms = [ ...socket.rooms ].filter(room => room.startsWith(GameManager.GAMEID_PREFIX))

        log
          .http('🟠 Disconnecting (%s)', reason, { socket_id: socket.id })
        // .debug('├─ leaving %d rooms (%s)', socket.rooms.size, [ ...socket.rooms ].join(', '))
        // .debug('└─ game rooms: ' + gameRooms.join(', '))

        if (gameRooms.length === 1) {
          const remainingSocketsInGame = this.io.sockets.in(gameRooms[0]).sockets
          if (remainingSocketsInGame.size === 1 && remainingSocketsInGame.has(socket.id)) {
            try {
              this.game.delete(gameRooms[0])
              log.debug('Last player leave %s, deleted', gameRooms[0], { socket_id: socket.id, game_id: gameRooms[0] })
            }
            catch (e) {
              log.error(e)
            }
          }
        }
        else {
          assert(gameRooms.length === 0, 'A player can\'t only be in one game at the time')
        }
      })
      .on('disconnect', (reason: string) => {
        //log.debug('Bye %o', this.clients.get(socket))
        this.clients.delete(socket)
        socket.disconnect(true)
        log.http('🔴 Disconnected (%s), %d client(s) remains', reason, this.connectedClientCounter, { socket_id: socket.id })
      })
  }

  private registerErrorHandler (socket: io.Socket): void {
    socket.on('error', (err) => {
      log.error(err, { socket_id: socket.id })
    })
  }

  private registerEventLogger (socket: io.Socket): void {
    socket.onAny((event, ...args) => {
      let callback = false
      if (args[args.length - 1] instanceof Function) {
        callback = true
        args.pop()
      }
      log.http(
        '⚡ Receive event',
        { socket_id: socket.id, event, args: util.inspect(args.length === 1 ? args[0] : args), callback },
      )
    })
  }

  private needToCreateNewGame (): boolean {
    return this.game.count() === 0
  }

  private getAvailableGame (): GameId {
    return this.game.list()[0].id
  }

  private stopWhenClientsAreDisconnected (): void {
    const pollingFrequency = 500
    let iterationsRemaining = GameServer.maxShutdownDelayInSeconds * 1000 / pollingFrequency
    const timeout = setInterval(() => {
      if (this.connectedClientCounter === 0 || iterationsRemaining <= 0) {
        clearTimeout(timeout)
        this.stopNow()
      }
      iterationsRemaining--
    }, pollingFrequency)
  }

  private stopNow (): void {
    log.verbose('Closing server...')

    if (this.connectedClientCounter > 0) {
      log.warn('Still %d client(s) after %ds delay, force close', this.connectedClientCounter, GameServer.maxShutdownDelayInSeconds)
      for (const [ id, socket ] of this.io.sockets.sockets) {
        socket.disconnect(true)
      }
    }
    this.http.close((failure?: Error) => {
      this.isShuttingDown = false
      this.startListeningAt = undefined
      log.info('🟥 Server closed')
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
