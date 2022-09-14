import React, { createContext } from 'react'
import { Socket } from 'socket.io-client'

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
  | { action: 'init:socket', socket: Socket }
  | { action: 'server:connect' }
  | { action: 'server:disconnect' }
  | { action: 'socket:connection:status' } & ConnectionStatus

export const SocketReducer = (state: SocketContextState, payload: SocketContextAction): SocketContextState => {
  const { action, ...args } = payload
  console.log('Message received - Action: ' + payload.action + ' - Payload: ', args)

  switch (action) {
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
