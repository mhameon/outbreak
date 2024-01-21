import React, { createContext } from 'react'
import { GameId, Nullable, Game } from '#shared/types'
import { Socket } from '../types'

export enum ServerConnectionStatus {
  disconnected,
  connected,
  connecting,
}

export type ConnectionStatus = {
  status: ServerConnectionStatus
  attempt?: number
  room?: string
} | {
  status: ServerConnectionStatus.connected
  attempt: never
  room: string
}

export type SocketContextState = {
  socket?: Socket
  connection: ConnectionStatus
  lobby?: {
    games: Array<Game>
  }
}

export const defaultSocketContextState: SocketContextState = {
  socket: undefined,
  connection: {
    status: ServerConnectionStatus.disconnected,
    attempt: undefined,
    room: undefined
  }
}

export type SocketContextAction =
  | { type: 'init:socket', socket: Socket }
  | { type: 'server:connect' }
  | { type: 'server:disconnect' }
  | { type: 'socket:connection:status' } & ConnectionStatus
  | { type: 'player:join:game', requestGameId?: Nullable<GameId> }
  | { type: 'player:leave:game', gameId: GameId }
  | { type: 'games:update', room: string, games: Array<Game> }

export const SocketReducer = (state: SocketContextState, payload: SocketContextAction): SocketContextState => {
  console.log('SocketReducer: Type=' + payload.type, payload)

  const isOnline = isConnected(state.connection)

  switch (payload.type) {
    case 'init:socket': {
      return { ...state, socket: payload.socket }
    }

    case 'server:connect' : {
      if (state.socket) {
        state.socket.connect()
        return { ...state, connection: { status: ServerConnectionStatus.connecting } }
      }
      break
    }

    case 'server:disconnect': {
      if (state.socket) {
        state.socket.disconnect()
        return { ...state, connection: { status: ServerConnectionStatus.disconnected } }
      }
      break
    }

    case 'socket:connection:status': {
      return { ...state, connection: { status: payload.status, attempt: payload.attempt } }
    }

    case 'player:join:game': {
      if (isConnected(state.connection)) {
        state.socket?.emit(
          'player:join:game',
          { requestedGameId: payload.requestGameId ?? null },
          (gameId) => {
            console.log('server ack', gameId)
          }
        )
      }
      break
    }

    case 'player:leave:game': {
      if (isOnline) {
        const gameId: GameId = 'game_something' // fixme get real current game
        state.socket?.emit('player:leave:game', gameId, ({ ok }) => {
          console.log(`player:leave:game "${gameId}": ${ok}`)
        })
      }
      break
    }

    case 'games:update': {
      if (isOnline) {
        //if (state.connection.room !== payload.room) {
        return { ...state, connection: { ...state.connection, room: payload.room }, lobby: { games: payload.games } }
        // } else {
        //   console.warn(`already in ${payload.room}`)
      } else {
        //   console.warn(`already in ${payload.room}`)
        // }
      }
      break
    }

    default: {
      throw Error('Unknown case', payload)
    }
  }

  return state
}

export interface SocketContextProps {
  socketState: SocketContextState;
  dispatchSocketState: React.Dispatch<SocketContextAction>;
}

export const SocketContext = createContext<SocketContextProps>({
  socketState: defaultSocketContextState,
  dispatchSocketState: () => {
  }
})

export function isConnected (connection: ConnectionStatus) {
  return connection.status === ServerConnectionStatus.connected
}
