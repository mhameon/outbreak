import { useEffect, useRef } from 'react'
import io from 'socket.io-client'
import type { ManagerOptions, Socket, SocketOptions } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '../../../shared/events'

export const useSocket = (url: string, options?: Partial<ManagerOptions & SocketOptions>): Socket<ServerToClientEvents, ClientToServerEvents> => {
  const { current: socket } = useRef(io(url, options))

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [ socket ])

  return socket
}
