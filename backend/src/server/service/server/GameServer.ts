import { Plugin } from '#server/service/server/index'
import assert from 'assert'
import config from 'config'
import http from 'http'
import type { AddressInfo } from 'net'
import express, { Express } from 'express'
import * as io from 'socket.io'
import { log, registerEventLogger } from './serverLogger'
import { GameManager } from '#engine/game/GameManager'
import { GameId } from '#engine/types'
import { ConnectionRefusedError } from './ServerErrors'
import event from '#engine/events'

// Todo: continue typing
// Fixme: must lives in another file?
export type Player = {
  id: string
  name?: string
}

type SocketInformation = {
  id: string
  connectedAt: Date
}

export interface ServerStatus {
  started: boolean
  uptime: number
  rooms: Array<string>
  clients: Array<{ id: string; rooms: string[] }>
}

const LOBBY = 'lobby'

/**
 * Multiplayer socket server
 */
export class GameServer {
  static maxShutdownDelayInSeconds = 5

  readonly express: Express
  private readonly http: http.Server
  private readonly io: io.Server

  readonly game: GameManager
  private readonly rooms = new Set<string>()
  private readonly clients = new WeakMap<io.Socket, { player: Player; socket: SocketInformation }>()

  private isShuttingDown = false
  private startListeningAt?: Date

  constructor (manager: GameManager) {
    this.game = manager

    this.express = express()
    this.http = http.createServer(this.express)
    this.io = new io.Server(this.http, {
      cors: {
        origin: [ config.server.http.host ],
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
      const { 'user-agent': userAgent, host } = socket.request.headers
      log.http(
        '🟢 Here come a new challenger! Total %d client(s)', this.connectedClientCounter,
        { socketId: socket.id, host, agent: userAgent },
      )

      this.joinRoom(socket, LOBBY)

      this.registerDisconnectionHandler(socket)
      this.registerErrorHandler(socket)
      registerEventLogger(socket)

      socket.on(event.game.join, (args: { gameId?: GameId }, ack: (data: { gameId: GameId | null }) => void) => {
        // Middleware for 'game:join' event. Error "catch" in socket.on('error', (err) => {}) handler
        // socket.use(([ event, ...args ], next) => {
        //   const game = [ ...socket.rooms ].find(r => r.startsWith(GameManager.GAME_ID_PREFIX))
        //   if (game) {
        //     socket.emit('msg', `Already in ${game}`)
        //     // //ack({ gameId: game })
        //     // return
        //     next(new ConnectionRefusedError(`Already in ${game}`))
        //   }
        // })

        // Act like middleware, but simpler
        let gameId = [ ...socket.rooms ].find(room => room.startsWith(GameManager.GAME_ID_PREFIX))
        if (gameId) {
          log.warn('Already in %s', gameId)
          socket.emit('msg', `Already in ${gameId}`)
          return
        }

        if (!args.gameId) {
          gameId = this.game.create()
        } else {
          gameId = args.gameId
          if (!this.game.has(gameId)) {
            return ack({ gameId: null })
          }
          log.debug('join %s', gameId)
        }

        this.leaveRoom(socket, LOBBY)
        this.joinRoom(socket, gameId)
        this.game.get(gameId).joinPlayer({ id: 'player' })

        socket.to(gameId).emit('msg', `Player ${socket.id} has joined the game`)
        socket.emit('msg', `You joined the game, ${socket.id}`)

        return ack({ gameId })
      })

      socket.on(event.game.leave, (args: { gameId: GameId }, ack: (data: { ok: boolean }) => void) => {
        this.leaveRoom(socket, args.gameId, (wasLast) => {
          if (wasLast) {
            this.game.delete(args.gameId)
          }
        })
        this.joinRoom(socket, LOBBY)
        return ack({ ok: true })
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

      // Strange bug: this.io.sockets.emit() or this.io.emit() don't always emit (if join a game before)
      this.io.emit('shutdown')
      // Seems to works better. bug in io?
      // for (const [ id, socket ] of this.io.sockets.sockets) { socket.emit('shutdown') }

      this.stopWhenClientsAreDisconnected()
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerPlugin (plugin: Plugin<any>): GameServer {
    if (plugin instanceof Function) {
      // Todo Keep trace of registered plugins?
      plugin(this)
    }
    return this
  }

  get connectedClientCounter (): number {
    return this.io.sockets.sockets.size
  }

  get status (): ServerStatus {
    const clients = []
    for (const [ id, socket ] of this.io.sockets.sockets) {
      clients.push({
        id, rooms: [ ...socket.rooms ].filter(r => r !== id),
      })
    }

    const uptime = this.http.listening && this.startListeningAt ? (+new Date() - +this.startListeningAt) / 1000 : 0

    return {
      started: this.http.listening,
      uptime: Math.round(+uptime),
      rooms: [ ...this.rooms.values() ],
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
      // Todo Properly check if clients are authorize to connect (valid session cookie)
      // Todo Check authentication & get user information
      const authenticated = true

      if (!authenticated) {
        next(new ConnectionRefusedError('Unauthenticated user', log.error))
      }

      // Fixme Keep? Or move clients in each Outbreak via GameManager?
      this.clients.set(socket, {
        player: {
          id: +new Date() + '',
          name: 'Harcoded name ' + Math.random(),
        },
        socket: {
          id: socket.id,
          connectedAt: new Date()
        }
      })

      next()
    })
  }

  private registerDisconnectionHandler (socket: io.Socket): void {
    socket
      .on('disconnecting', (reason) => {
        const gameRooms = [ ...socket.rooms ].filter(room => room.startsWith(GameManager.GAME_ID_PREFIX))

        log.http('🟠 Disconnecting (%s)', reason, { socketId: socket.id })

        if (gameRooms.length === 1) {
          const gameId = gameRooms[0]

          this.leaveRoom(socket, gameId, (wasLast) => {
            if (wasLast) {
              this.game.delete(gameId)
            }
          })
        } else {
          assert(gameRooms.length === 0, 'A player can\'t only be in one game at the time')
        }
      })
      .on('disconnect', (reason: string) => {
        //log.debug('Bye %o', this.clients.get(socket))
        this.clients.delete(socket)
        socket.disconnect(true)
        log.http('🔴 Disconnected (%s), %d client(s) remains', reason, this.connectedClientCounter, { socketId: socket.id })
      })
  }

  private registerErrorHandler (socket: io.Socket): void {
    socket.on('error', (error) => {
      log.error(error)
    })
  }

  private joinRoom (socket: io.Socket, room: string): boolean {
    let isFirst = false
    if (!socket.rooms.has(room)) {
      if (!this.rooms.has(room)) {
        this.rooms.add(room)
        isFirst = true
      }
      socket.join(room)
      log.info('💚 Join room `%s`', room, { socketId: socket.id, room, isFirst })
    }
    return isFirst
  }

  private leaveRoom (socket: io.Socket, room: string, callback?: (wasLast: boolean) => void): void {
    let wasLast = false
    if (socket.rooms.has(room)) {
      socket.leave(room)
      const socketsInRoom = [ ...this.io.sockets.sockets.values() ].filter(socket => socket.rooms.has(room))
      if (socketsInRoom.length === 0) {
        this.rooms.delete(room)
        wasLast = true
      }
      log.info('💔 Leave room `%s`', room, { socketId: socket.id, room, wasLast })
    } else {
      log.warn('Can\'t leave a room you\'re not in', room, { socketId: socket.id, room })
    }
    if (callback) {
      callback(wasLast)
    }
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
      for (const [ , socket ] of this.io.sockets.sockets) {
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
    process.exit(1)
  }

  private gracefulShutdown (signal: NodeJS.Signals): void {
    this.close(signal)
  }
}
