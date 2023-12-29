import assert from 'assert'
import config from 'config'
import http from 'http'
import type { AddressInfo } from 'net'
import type { Express, RequestHandler } from 'express'
import type { Socket as SocketIO } from 'socket.io'
import { Server } from 'socket.io'
import { registerSocketEventLogger } from './socketEventLogger'
import { GameManager } from '#engine/game/GameManager'
import { ConnectionRefusedError } from './ServerErrors'
import type { InterServerEvents, SocketData } from '#engine/events'
import type { ClientToServerEvents, ServerToClientEvents } from '#shared/io.events'
import type { SocketId } from 'socket.io-adapter'
import { NotFoundError } from '#common/Errors'
import { getLogger } from '#common/logger'
import { type Nullable, type GameId, type Voidable, LOBBY } from '#shared/types'
import { isGameId } from '#engine/guards'
import { corsOptions } from '#server/http/middleware'

type Socket = SocketIO<ClientToServerEvents, ServerToClientEvents>

export type Plugin<T> = ((server: GameServer) => Voidable<T>) | Voidable<T>

// Todo: continue typing
// Fixme: must lives in another (shared) file
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
 * Multiplayer socket.io server
 */
export class GameServer {
  static maxShutdownDelayInSeconds = 5

  readonly log = getLogger('GameServer')
  readonly #http: http.Server
  readonly #io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>

  readonly game: GameManager // Todo replace with interface and implement it in GameManager
  readonly #rooms = new Set<string>()
  readonly #clients = new Map<SocketId, ConnectedPlayer>()

  #isShuttingDown = false
  #startListeningAt?: Date

  constructor (express: { app: Express; session: RequestHandler }, manager: GameManager) {
    this.log.info('GameServer is starting...', { env: config.util.getEnv('NODE_ENV') })
    this.game = manager
    this.#http = http.createServer(express.app)
    this.#io = new Server(this.#http, {
      cors: corsOptions // fixme check options to use
    })

    this.registerAuthentication(express.session)
    this.registerGameManager()
    this.#io.on('connection', (socket: Socket) => {
      const session = socket.request.session

      // join unique room per session to easily get the socket by session id
      socket.join(session.id)

      // reload the session on each incoming packet to be able to use up to date `socket.request.session` in
      // each listener. DON'T FORGET to call `socket.request.session.save()` to apply session update.
      socket.use((__, next) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session.reload((err: any) => {
          if (err) {
            this.log.error(err)
            socket.disconnect()
          } else {
            next()
          }
        })
      })


      const name = this.#clients.get(socket.id)?.player?.name
      this.log.http(
        '🟢 Here come a new challenger! Hello %s! %d client(s) connected', name, this.connectedClientCounter,
        { socketId: socket.id, sessionId: session.id /*, handshake: socket.handshake*/ },
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
    this.#isShuttingDown = false
    if (this.#http.listening) {
      this.log.warn('Server is already listening')
      return
    }

    this.#http.listen(port, () => {
      this.#startListeningAt = new Date()
      const { address } = this.#http.address() as AddressInfo
      this.log.info('🟩 Server listening, awaiting connections on %s:%s', address === '::' ? 'localhost' : address, port)
      this.log.silly('─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─')
    })
  }

  close (reason?: string): void {
    if (this.#http.listening && !this.#isShuttingDown) {
      this.#isShuttingDown = true
      this.log.info(
        'Server shutdown initiated (%s)...',
        reason ? `${reason} received` : 'close() called'
      )

      if (this.connectedClientCounter === 0) {
        this.stopNow()
        return
      }
      this.log.http('Emit `shutdown` to %d client(s)', this.connectedClientCounter)

      // Strange bug: this.io.sockets.emit() or this.io.emit() don't always emit (if join a game before)
      this.#io.emit('server:shutdown')
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
    return this.#io.engine.clientsCount
  }

  get status (): ServerStatus {
    const clients = []
    for (const [ id, socket ] of this.#io.sockets.sockets) {
      const connectedPlayer = this.#clients.get(id)
      clients.push({
        id,
        rooms: [ ...socket.rooms ].filter(r => r !== id),
        connectedPlayer
      })
    }

    //FIXME do it properly
    console.log({ rooms: this.#io.sockets.adapter.rooms, sids: this.#io.sockets.adapter.sids })

    const uptime = this.#http.listening && this.#startListeningAt ? (+new Date() - +this.#startListeningAt) / 1000 : 0
    return {
      started: this.#http.listening,
      uptime: Math.round(+uptime),
      rooms: [ ...this.#rooms.values() ],
      clients,
    }
  }

  disconnectClient (sessionId: string): void {
    this.log.debug('Session logout', { sessionId })
    this.#io.in(sessionId).disconnectSockets(true)
  }

  private registerGameManager (): void {
    this.game.on('game:created', (outbreak) => {
      outbreak.on('game:turn:resolved', async ({ gameId, turn }) => {
        const sockets = await this.#io.in(gameId).fetchSockets()
        for (const socket of sockets) {
          const client = this.#clients.get(socket.id)
          if (client) {
            socket.emit('msg', `Turn ${turn + 1} will begin...`)
            socket.emit('game:state', outbreak.serialize(client.player.id))
          }
        }
      })

      this.#io.in(LOBBY).emit('games:update', LOBBY, this.game.list())
    })
    this.game.on('game:deleted', (_gameId) => {
      this.#io.in(LOBBY).emit('games:update', LOBBY, this.game.list())
    })

    this.#io.of('/').adapter.on('join-room', (room, id) => {
      if (room !== LOBBY) {
        this.#io.to(id).emit('games:update', LOBBY, this.game.list())
      }
    })
  }

  private registerPlayerActions (socket: Socket): void {
    socket
      .on('player:join:game', ({ requestedGameId }, ack) => {
        const connectedPlayer = this.#clients.get(socket.id)
        assert(connectedPlayer, new NotFoundError(socket.id))

        let gameId: GameId
        if (requestedGameId) {
          if (socket.rooms.has(requestedGameId)) {
            this.log.warn('Already in %s, player can be only in one game at the time', requestedGameId)
            socket.emit('msg', `Already in ${requestedGameId}`)
            return ack({ gameId: null })
          }
          if (!this.game.has(requestedGameId)) {
            this.log.warn('Requested game %s doesn\'t exists', requestedGameId)
            return ack({ gameId: null })
          }
          gameId = requestedGameId
        } else {
          gameId = this.game.create()
        }

        const outbreak = this.game.get(gameId)
        if (outbreak.join(connectedPlayer.player)) {
          this.log.debug('join %s', gameId)

          this.leaveRoom(socket, LOBBY)
          this.joinRoom(socket, gameId)
          socket.emit('msg', `You joined the game ${socket.id}`)
          socket.to(gameId).emit('msg', `Player ${socket.id} has joined the game!`)

          return ack({ gameId })
        } else {
          return ack({ gameId: null })
        }
      })
      .on('player:leave:game', (gameId, ack) => {
        const connectedPlayer = this.#clients.get(socket.id)
        assert(connectedPlayer, new NotFoundError(socket.id))
        const outbreak = this.game.get(gameId)
        if (outbreak.leave(connectedPlayer.player)) {
          // todo
        }
        this.leaveRoom(socket, gameId, (wasLast) => {
          if (wasLast) {
            this.game.delete(gameId)
          }
        })
        this.joinRoom(socket, LOBBY)

        return ack({ ok: true })
      })
  }

  /**
   * Handle Express session
   * @see https://socket.io/how-to/use-with-express-session
   */
  private registerAuthentication (session: RequestHandler): void {
    this.#io.engine.use(session)
    this.#io.use((socket, next) => {
      const session = socket.request.session

      if (this.#isShuttingDown) {
        // Reject new connection when server is shutting down
        return next(new ConnectionRefusedError('Server is shutting down', this.log.info))
      }
      if (!session || !session?.user) {
        // Reject unauthenticated user
        return next(new ConnectionRefusedError('Unauthenticated user', this.log.error))
      }
      if (this.#io.sockets.adapter.rooms.has(session.id)) {
        // Reject duplicated session
        return next(new ConnectionRefusedError('Already connected', this.log.error))
      }
      // TODO reject the same user with 2 different session to connect (check session.user.id vs. all connected sockets)

      // Fixme: identify player and set it here
      if (session.user) {
        this.#clients.set(socket.id, {
          player: {
            id: socket.id,
            name: session.user.name,
          },
          socket: {
            id: socket.id,
            room: null,
            connectedAt: new Date()
          }
        })
      }
      next()
    })
  }

  private registerDisconnectionListeners (socket: Socket): void {
    socket
      .on('disconnecting', (reason) => {
        this.log.http('🟠 Disconnecting (%s)', reason, { socketId: socket.id })
        const gameRooms = [ ...socket.rooms ].filter(isGameId)
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
        this.#clients.delete(socket.id)
        socket.disconnect(true)
        this.log.http('🔴 Disconnected (%s), %d client(s) remains', reason, this.connectedClientCounter, { socketId: socket.id })
      })
  }

  private joinRoom (client: Socket, room: string): boolean {
    let isFirst = false
    if (!client.rooms.has(room)) {
      if (!this.#rooms.has(room)) {
        this.#rooms.add(room)
        isFirst = true
      }
      client.join(room)

      const connectedPlayer = this.#clients.get(client.id)
      assert(connectedPlayer)
      connectedPlayer.socket.room = room
      this.#clients.set(client.id, connectedPlayer)

      this.log.info('💚 Join room `%s`', room, { socketId: client.id, room, isFirst })
    }
    return isFirst
  }

  private leaveRoom (client: Socket, room: string, onceLeaved ?: (wasLast: boolean) => void): void {
    let wasLast = false
    if (client.rooms.has(room)
    ) {
      client.leave(room)
      const socketsInRoom = [ ...this.#io.sockets.sockets.values() ].filter(socket => socket.rooms.has(room))
      if (socketsInRoom.length === 0) {
        this.#rooms.delete(room)
        wasLast = true
      }
      this.log.info('💔 Leave room `%s`', room, { socketId: client.id, room, wasLast })
    } else {
      this.log.warn('Can\'t leave a room you\'re not in', room, { socketId: client.id, room })
    }
    if (onceLeaved) {
      onceLeaved(wasLast)
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

    if (this.connectedClientCounter > 0
    ) {
      this.log.warn('Still %d client(s) after %ds delay, force close', this.connectedClientCounter, GameServer.maxShutdownDelayInSeconds)
      for (const [ , socket ] of this.#io.sockets.sockets) {
        socket.disconnect(true)
      }
    }
    this.#http.close((failure?: Error) => {
      this.#isShuttingDown = false
      this.#startListeningAt = undefined
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
