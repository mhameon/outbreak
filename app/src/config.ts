import type { ManagerOptions, SocketOptions } from 'socket.io-client'

type Config = {
  http: {
    pathname: string
    port: number
  },
  ws: {
    host: string,
    port: number
    options: Partial<ManagerOptions & SocketOptions>
  }
}

export const config: Config = {
  http: {
    pathname: 'api',
    port: 8080,
  },
  ws: {
    host: '',
    port: 8080,
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
