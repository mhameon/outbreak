import { Plugin } from '#server/service/server/index'
import assert from 'assert'
import config from 'config'
import http from 'http'
import type { AddressInfo } from 'net'
import express, { Express } from 'express'
import { Server } from 'socket.io'
import type { Socket } from 'socket.io'
import { registerSocketEventLogger } from './socketEventLogger'
import { GameManager } from '#engine/game/GameManager'
import { GameId } from '#engine/types'
import { ConnectionRefusedError } from './ServerErrors'
import { isGameId } from '#engine/guards'
import type { InterServerEvents, SocketData } from '#engine/events'
import type { ClientToServerEvents, ServerToClientEvents } from '#shared/events'
import { Nullable } from '#common/types'
import type { SocketId } from 'socket.io-adapter'
import { NotFoundError } from '#common/Errors'
import { getLogger } from '#common/logger'

const LOBBY = 'lobby' as const

// Todo: continue typing
// Fixme: must lives in another file?
export type PlayerId = string
export type Player = {
  id: PlayerId // fixme we are using SocketId for now, but will player db id
  name?: string
}

export type ConnectedPlayer = {
  player: Player
  socket: SocketInformation
}

type SocketInformation = {
  id: SocketId
  room: Nullable<string>
  connectedAt: Date // fixme improve structure: this date of server connection, not room connection
}

export interface ServerStatus {
  started: boolean
  uptime: number
  rooms: Array<string>
  clients: Array<{ id: string; rooms: string[]; connectedPlayer?: ConnectedPlayer }>
}

/**
 * Multiplayer socket server
 */
export class GameServer {
  static maxShutdownDelayInSeconds = 5

  readonly log = getLogger('GameServer')
  readonly express: Express
  private readonly http: http.Server
  private readonly io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>

  readonly game: GameManager
  private readonly rooms = new Set<string>()
  private readonly clients = new Map<SocketId, ConnectedPlayer>()

  private isShuttingDown = false
  private startListeningAt?: Date

  constructor (manager: GameManager) {
    this.game = manager

    this.express = express()
    this.http = http.createServer(this.express)
    this.io = new Server(this.http, {
      // todo check options to use
      cors: {
        origin: [ config.server.http.host ],
        methods: [ 'GET', 'POST' ],
        //allowedHeaders: [ 'my-custom-header' ],
        credentials: true,
      },
    })

    this.registerMiddlewares()
    this.registerGameManager()
    this.io.on('connection', (socket: Socket) => {
      const { 'user-agent': agent, host } = socket.handshake.headers
      this.log.http(
        '🟢 Here come a new challenger! Total %d client(s)', this.connectedClientCounter,
        { socketId: socket.id, host, agent },
      )

      this.registerDisconnectionListeners(socket)
      registerSocketEventLogger(socket, this.log)
      this.registerPlayerActions(socket)
      this.joinRoom(socket, LOBBY)
    })

    process.on('SIGINT', this.gracefulShutdown.bind(this))
    process.on('SIGTERM', this.gracefulShutdown.bind(this))
    process.on('uncaughtException', this.uncaughtException.bind(this))
  }

  listen (port: number): void {
    this.isShuttingDown = false
    if (this.http.listening) {
      this.log.warn('Server is already listening')
      return
    }

    this.http.listen(port, () => {
      this.startListeningAt = new Date()
      const { address } = this.http.address() as AddressInfo
      this.log.info('🟩 Server listening, awaiting connections on %s:%s', address === '::' ? 'localhost' : address, port)
      this.log.silly('─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─')
    })
  }

  close (reason?: string): void {
    if (this.http.listening && !this.isShuttingDown) {
      this.isShuttingDown = true
      reason = reason ? `${reason} received` : 'close() called'
      this.log.info('Server shutdown initiated (%s)...', reason)

      if (this.connectedClientCounter === 0) {
        this.stopNow()
        return
      }
      this.log.http('Emit `shutdown` to %d client(s)', this.connectedClientCounter)

      // Strange bug: this.io.sockets.emit() or this.io.emit() don't always emit (if join a game before)
      this.io.emit('server:shutdown')
      // Seems to work better. bug in io?
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
    return this.io.engine.clientsCount
  }

  get status (): ServerStatus {
    const clients = []
    for (const [ id, socket ] of this.io.sockets.sockets) {
      const connectedPlayer = this.clients.get(id)
      clients.push({
        id,
        rooms: [ ...socket.rooms ].filter(r => r !== id),
        connectedPlayer
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

  private registerGameManager (): void {
    this.game.on('game:created', (outbreak) => {
      outbreak.on('game:turn:resolved', ({ gameId, turn }) => {
        const newTurn = turn + 1
        this.io.in(gameId).allSockets().then((socketIds) => {
          for (const socketId of socketIds) {
            const client = this.clients.get(socketId)
            if (client) {
              const socket = this.io.to(socketId)
              socket.emit('msg', `Turn ${newTurn} is starting`)
              socket.emit('game:state', outbreak.getGameState(client.player.id))
            }
          }
        })
        //todo + send updated game state (Outbreak in JSON)
      })
    })
  }

  private registerPlayerActions (socket: Socket): void {
    socket
      .on('player:join:game', ({ requestedGameId }: { requestedGameId?: GameId }, ack: (data: { gameId: Nullable<GameId> }) => void) => {
        // socket.on(event.game.join, (args) => {
        // Middleware for 'game:join' event. Error "catch" in socket.on('error', (err) => {}) handler
        // socket.use(([ event, ...args ], next) => {
        //   const game = [ ...socket.rooms ].find(r => r.startsWith(GAME_ID_PREFIX))
        //   if (game) {
        //     socket.emit('msg', `Already in ${game}`)
        //     // //ack({ gameId: game })
        //     // return
        //     next(new ConnectionRefusedError(`Already in ${game}`))
        //   }
        // })
        const connectedPlayer = this.clients.get(socket.id)
        assert(connectedPlayer, new NotFoundError(socket.id))

        // A player can be only in one game at the time
        let gameId = [ ...socket.rooms ].find(isGameId)
        if (gameId) {
          this.log.warn('Already in %s', gameId)
          socket.emit('msg', `Already in ${gameId}`)
          return
        }

        if (!requestedGameId) {
          gameId = this.game.create()
        } else {
          gameId = requestedGameId
          if (!this.game.has(gameId)) {
            return ack({ gameId: null })
          }
          this.log.debug('join %s', gameId)
        }

        const party = this.game.get(gameId)
        if (party.joinPlayer(connectedPlayer.player)) {

          this.leaveRoom(socket, LOBBY)
          this.joinRoom(socket, gameId)
          socket.to(gameId).emit('msg', `Player ${socket.id} has joined the game`)
          socket.emit('msg', `You joined the game, ${socket.id}`)

          return ack({ gameId })
        } else {
          return ack({ gameId: null })
        }
      })
      //.on('player:leave:game', ({ gameId }: { gameId: GameId }, ack: (data: { ok: boolean }) => void) => {
      .on('player:leave:game', (gameId, ack: (data: { ok: boolean }) => void) => {
        this.leaveRoom(socket, gameId, (wasLast) => {
          if (wasLast) {
            this.game.delete(gameId)
          }
        })
        this.joinRoom(socket, LOBBY)

        return ack({ ok: true })
      })
  }

  private registerMiddlewares (): void {
    // Reject new connection when server is shutting down
    this.io.use((socket, next) => {
      if (this.isShuttingDown) {
        next(new ConnectionRefusedError('Server is shutting down', this.log.info))
      }
      next()
    })

    // Manage authentification
    this.io.use((socket, next) => {
      // Todo Properly check if clients are authorize to connect (valid session cookie)
      // Todo Check authentication & find user information
      const authenticated = true

      if (!authenticated) {
        next(new ConnectionRefusedError('Unauthenticated user', this.log.error))
      }

      // Fixme: identify player and set it here
      this.clients.set(socket.id, {
        player: {
          id: socket.id,
          name: 'Hardcoded name ' + Math.random(),
        },
        socket: {
          id: socket.id,
          room: null,
          connectedAt: new Date()
        }
      })

      next()
    })

    // room middleware seems to work
    // this.io.in(LOBBY).use((socket, next) => {
    //   this.log.debug('lobby')
    //   next()
    // })
  }

  private registerDisconnectionListeners (socket: Socket): void {
    socket
      .on('disconnecting', (reason) => {
        const gameRooms = [ ...socket.rooms ].filter(isGameId)
        this.log.http('🟠 Disconnecting (%s)', reason, { socketId: socket.id })
        if (gameRooms.length === 1) {
          const [ gameId ] = gameRooms

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
        this.clients.delete(socket.id)
        socket.disconnect(true)
        this.log.http('🔴 Disconnected (%s), %d client(s) remains', reason, this.connectedClientCounter, { socketId: socket.id })
      })
  }

  private joinRoom (client: Socket, room: string): boolean {
    let isFirst = false
    if (!client.rooms.has(room)) {
      if (!this.rooms.has(room)) {
        this.rooms.add(room)
        isFirst = true
      }
      client.join(room)

      const connectedPlayer = this.clients.get(client.id)
      assert(connectedPlayer)
      connectedPlayer.socket.room = room
      this.clients.set(client.id, connectedPlayer)

      this.log.info('💚 Join room `%s`', room, { socketId: client.id, room, isFirst })
    }
    return isFirst
  }

  private leaveRoom (client: Socket, room: string, callback?: (wasLast: boolean) => void): void {
    let wasLast = false
    if (client.rooms.has(room)) {
      client.leave(room)
      const socketsInRoom = [ ...this.io.sockets.sockets.values() ].filter(socket => socket.rooms.has(room))
      if (socketsInRoom.length === 0) {
        this.rooms.delete(room)
        wasLast = true
      }
      this.log.info('💔 Leave room `%s`', room, { socketId: client.id, room, wasLast })
    } else {
      this.log.warn('Can\'t leave a room you\'re not in', room, { socketId: client.id, room })
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
    this.log.verbose('Closing server...')

    if (this.connectedClientCounter > 0) {
      this.log.warn('Still %d client(s) after %ds delay, force close', this.connectedClientCounter, GameServer.maxShutdownDelayInSeconds)
      for (const [ , socket ] of this.io.sockets.sockets) {
        socket.disconnect(true)
      }
    }
    this.http.close((failure?: Error) => {
      this.isShuttingDown = false
      this.startListeningAt = undefined
      this.log.info('🟥 Server closed')
      if (failure) {
        this.log.error(failure)
      }
    })
  }

  private uncaughtException (error: Error): void {
    this.log.error('⚠️ uncaughtException %s', error.stack ? error.stack : `${error.name}: ${error.message}`)
    this.close('uncaughtException')
    process.exit(1)
  }

  private gracefulShutdown (signal: NodeJS.Signals): void {
    this.close(signal)
  }
}
