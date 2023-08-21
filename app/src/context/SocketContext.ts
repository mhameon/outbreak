import React, { createContext } from 'react'
import { Socket } from 'socket.io-client'
import { GameId, Nullable } from '../../../shared/types'

export enum ServerConnectionStatus {
  disconnected,
  connected,
  connecting,
}

export type ConnectionStatus = {
  status: ServerConnectionStatus
  attempt?: number
}

export interface SocketContextState {
  socket?: Socket
  connection: ConnectionStatus
}

export const defaultSocketContextState: SocketContextState = {
  socket: undefined,
  connection: {
    status: ServerConnectionStatus.disconnected,
    attempt: undefined
  }
}

type SocketContextAction =
  | { type: 'init:socket', socket: Socket }
  | { type: 'server:connect' }
  | { type: 'server:disconnect' }
  | { type: 'socket:connection:status' } & ConnectionStatus
  | { type: 'player:join:game' }
  | { type: 'player:leave:game' }

export const SocketReducer = (state: SocketContextState, payload: SocketContextAction): SocketContextState => {
  const { type, ...args } = payload
  console.log('Message received - Action: ' + payload.type + ' - Payload: ', args)

  switch (type) {
    case 'init:socket':
      return { ...state, socket: payload.socket }

    case 'server:connect' :
      if (state.socket) {
        state.socket.connect()
        return { ...state, connection: { status: ServerConnectionStatus.connecting, attempt: undefined } }
      }
      break

    case 'server:disconnect':
      if (state.socket) {
        state.socket.disconnect()
        return { ...state, connection: { status: ServerConnectionStatus.disconnected, attempt: undefined } }
      }
      break

    case 'socket:connection:status':
      return { ...state, connection: { status: payload.status, attempt: payload.attempt } }

    case 'player:join:game':
      if (state.connection.status === ServerConnectionStatus.connected) {
        state.socket?.emit(
          'player:join:game',
          undefined,
          ({ gameId }: { gameId: Nullable<GameId> }) => console.log(gameId)
        )
      }
      break
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
