import { LogLevel } from '#common/logger'
import 'config'

declare module 'config' {
  interface IConfig {
    server: {
      ws: {
        host: string
        port: number
      }
      http: {
        host: string
        port: number
        session: {
          name: string
        }
      }
      cli: {
        enabled: boolean
      }
    }
    logger: {
      level: LogLevel
      exception: boolean
    }
  }
}
