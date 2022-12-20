import React, { PropsWithChildren, useEffect, useReducer, useState, useMemo } from 'react'
import { useSocket } from '../../hook/useSocket'
import {
  defaultSocketContextState,
  SocketContext,
  SocketReducer,
  ServerConnectionStatus,
} from '../SocketContext'
import { config } from '../../config'

export const SocketProvider = ({ children }: PropsWithChildren) => {
  const socket = useSocket(config.socket.uri, config.socket.options)
  const [ loading, setLoading ] = useState(true)
  const [ socketState, dispatchSocketState ] = useReducer(SocketReducer, defaultSocketContextState)

  useEffect(() => {
    dispatchSocketState({ action: 'init:socket', socket })
    registerListeners()
    setLoading(false)
    // eslint-disable-next-line
  }, [])

  const registerListeners = () => {
    /** Connection / reconnection listeners */
    socket.io.on('reconnect', (attempt) => {
      dispatchSocketState({ action: 'socket:connection:status', status: ServerConnectionStatus.connected })
      console.info(`Reconnected on attempt: ${attempt}`)
    })

    socket.io.on('reconnect_attempt', (attempt) => {
      dispatchSocketState({
        action: 'socket:connection:status',
        status: ServerConnectionStatus.connecting,
        attempt,
      })
      console.info('Reconnection Attempt: ' + attempt)
    })

    // Handles server auth middleware (before connection occurs)
    socket.on('connect_error', (err) => {
      dispatchSocketState({ action: 'server:disconnect' })
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
      dispatchSocketState({ action: 'socket:connection:status', status: ServerConnectionStatus.disconnected })

      // FIXME
      alert('We are unable to connect you to the chat service.  Please make sure your internet connection is stable or try again later.')
    })

    socket.on('connect', () => {
      dispatchSocketState({ action: 'socket:connection:status', status: ServerConnectionStatus.connected })
      console.log(`connect`)
    })

    socket.on('server:shutdown', () => {
      socket.disconnect()
      console.log('Server shutdown')
    })

    socket.on('disconnect', (reason: string) => {
      // setRequestedGameId('')
      // setConnection({
      //   id: client.id,
      //   gameId: null,
      //   isConnected: client.connected,
      // })
      dispatchSocketState({ action: 'socket:connection:status', status: ServerConnectionStatus.disconnected })
      console.log(`disconnected (${reason})`)
    })
  }

  const value = useMemo(() => {
    return { socketState, dispatchSocketState }
  }, [ socketState ])

  if (loading) return <p>Loading Server...</p>

  return <SocketContext.Provider value={value}>
    {children}
  </SocketContext.Provider>
}
