import { Socket as SocketIO } from 'socket.io-client'
import { ServerToClientEvents, ClientToServerEvents } from '#shared/io.events'

export type Socket = SocketIO<ServerToClientEvents, ClientToServerEvents>
