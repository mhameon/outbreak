import type { ManagerOptions, SocketOptions } from 'socket.io-client'

type Config = {
  server: {
    host: string
  },
  socket: {
    uri: string,
    options: Partial<ManagerOptions & SocketOptions>
  }
}

export const config: Config = {
  server: {
    host: 'http://localhost:8080/api'
  },
  socket: {
    uri: 'ws://localhost:8080',
    options: {
      transports: [ 'websocket' ],
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 2000,
      autoConnect: false
    }
  }
}
