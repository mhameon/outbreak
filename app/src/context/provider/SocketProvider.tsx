import React, { PropsWithChildren, useEffect, useReducer, useState, useMemo } from 'react'
import { useSocket } from '../../hooks/useSocket'
import {
  defaultSocketContextState,
  SocketContext,
  SocketReducer,
  ServerConnectionStatus
} from '../SocketContext'
import { config } from '../../config'

export const SocketProvider = ({ children }: PropsWithChildren) => {
  const socket = useSocket(config.socket.uri, config.socket.options)
  const [ loading, setLoading ] = useState(true)
  const [ socketState, dispatchSocketState ] = useReducer(SocketReducer, defaultSocketContextState)

  useEffect(() => {
    registerListeners()
    dispatchSocketState({ action: 'init:socket', socket })
    setLoading(false)
    // eslint-disable-next-line
  }, [])

  const registerListeners = () => {
    /** Connection / reconnection listeners */
    socket.io.on('reconnect', (attempt) => {
      console.info('Reconnected on attempt: ' + attempt)
      dispatchSocketState({ action: 'socket:connection:status', status: ServerConnectionStatus.connected })
    })

    socket.io.on('reconnect_attempt', (attempt) => {
      console.info('Reconnection Attempt: ' + attempt)
      dispatchSocketState({
        action: 'socket:connection:status',
        status: ServerConnectionStatus.connecting,
        attempt
      })
    })

    // Handles server auth middleware (before connection occurs)
    socket.on('connect_error', (err) => {
      console.error('io.on(connect_error) ' + err.message) // prints the message associated with the error
      dispatchSocketState({ action: 'server:disconnect' })
    })

    socket.io.on('error', (error) => {
      console.warn(error.message)
      console.error('io.on("error")', error)

      // FIXME
      switch (error.message) {
        case 'websocket error':
          alert('Server down')
          break
      }
    })

    socket.io.on('reconnect_error', (error) => {
      console.info('Reconnection error: ' + error)
    })

    socket.io.on('reconnect_failed', () => {
      console.info('Reconnection failure.')
      dispatchSocketState({ action: 'socket:connection:status', status: ServerConnectionStatus.disconnected })

      // FIXME
      alert('We are unable to connect you to the chat service.  Please make sure your internet connection is stable or try again later.')
    })

    socket.on('connect', () => {
      console.log(`connect`)
      dispatchSocketState({ action: 'socket:connection:status', status: ServerConnectionStatus.connected })
    })

    socket.on('server:shutdown', () => {
      console.log('Server shutdown')
      socket.disconnect()
    })

    socket.on('disconnect', (reason: string) => {
      console.log(`disconnected (${reason})`)
      // isConnecting(false)
      // setRequestedGameId('')
      // setConnection({
      //   id: client.id,
      //   gameId: null,
      //   isConnected: client.connected,
      // })
      dispatchSocketState({ action: 'socket:connection:status', status: ServerConnectionStatus.disconnected })
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
