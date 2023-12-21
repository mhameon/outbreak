import { useEffect, useRef } from 'react'
import io from 'socket.io-client'
import type { ManagerOptions, SocketOptions } from 'socket.io-client'
import { Socket } from '../types'

export const useSocket = (url: string, options?: Partial<ManagerOptions & SocketOptions>): Socket => {
  const { current: socket } = useRef<Socket>(io(url, options))

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [ socket ])

  return socket
}
