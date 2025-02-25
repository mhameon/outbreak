import React, { PropsWithChildren, useEffect, useReducer, useState, useMemo, useCallback } from 'react'
import { PacketType } from 'socket.io-parser'
import type { GameState } from '#shared/types'
import { useSocket } from '../../hook/useSocket'
import {
  defaultSocketContextState,
  SocketContext,
  SocketReducer,
  ServerConnectionStatus, type SocketContextAction,
} from '../SocketContext'
import { config } from '../../config'
import { Socket } from '../../types'

export const SocketProvider = ({ children }: PropsWithChildren) => {
  const socket = useSocket(`ws://${config.ws.host || window.location.hostname}:${config.ws.port}`, config.ws.options)
  const [ loading, setLoading ] = useState(true)
  const [ socketState, dispatchSocketState ] = useReducer(SocketReducer, defaultSocketContextState)

  useEffect(() => {
    dispatchSocketState({ type: 'init:socket', socket })
    registerListeners(socket, dispatchSocketState)
    setLoading(false)

    return () => {
      socket.io.removeAllListeners()
    }

    // eslint-disable-next-line
  }, [])


  const value = useMemo(() => {
    return { socketState, dispatchSocketState }
  }, [ socketState ])

  if (loading) return <p>Loading Server...</p>

  return <SocketContext.Provider value={value}>
    {children}
  </SocketContext.Provider>
}

const registerListeners = (socket: Socket, dispatchSocketState: React.Dispatch<SocketContextAction>) => {
  socket.io.on('packet', ({ type, data }) => {
    // called for each packet received
    console.debug(`>>> ${PacketType[type].padStart(8, ' ')}`, data)
  })

  // socket.io.engine.on('packetCreate', ({ type, data }) => {
  //   // called for each packet sent
  //   console.log('<<< send', { type, data })
  // })

  socket.on('games:update', (room, games) => {
    dispatchSocketState({ type: 'games:update', room, games: games || [] })
  })

  socket.on('game:state', (detail: GameState) => {
    console.log('socket.on("game:state")')
    document.dispatchEvent(new CustomEvent<GameState>('game:state', { detail }))
  })

  /** Connection / reconnection listeners */
  socket.io.on('reconnect', (attempt) => {
    dispatchSocketState({ type: 'socket:connection:status', status: ServerConnectionStatus.connected })
    console.info(`Reconnected on attempt: ${attempt}`)
  })

  socket.io.on('reconnect_attempt', (attempt) => {
    dispatchSocketState({
      type: 'socket:connection:status',
      status: ServerConnectionStatus.connecting,
      attempt,
    })
    console.info('Reconnection Attempt: ' + attempt)
  })

  // Handles server auth middleware (before connection occurs)
  socket.on('connect_error', (err) => {
    dispatchSocketState({ type: 'server:disconnect' })
    console.error(`connect_error: ${err.message}`)
  })

  socket.io.on('error', (error) => {
    console.error(`error: ${error.message}`)

    // FIXME
    switch (error.message) {
      case 'websocket error':
        alert('Server down')
        break
    }
  })

  socket.io.on('reconnect_error', (error) => {
    console.info(`reconnect_error ${error}`)
  })

  socket.io.on('reconnect_failed', () => {
    console.info('Reconnection failure.')
    dispatchSocketState({ type: 'socket:connection:status', status: ServerConnectionStatus.disconnected })

    alert('We are unable to connect you to the game server. Please make sure your internet connection is stable or try again later.')
  })

  socket.on('connect', () => {
    dispatchSocketState({ type: 'socket:connection:status', status: ServerConnectionStatus.connected })
    console.log(`connect`)
  })

  socket.on('server:shutdown', () => {
    socket.disconnect()
    console.log('Server shutdown')
  })

  socket.on('disconnect', (reason: string) => {
    dispatchSocketState({ type: 'socket:connection:status', status: ServerConnectionStatus.disconnected })
    console.log(`disconnected (${reason})`)
  })
}
