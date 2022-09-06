import { LogLevel } from '#common/logger/index'
import 'config'

declare module 'config' {
  interface IConfig {
    server: {
      port: number
      http: {
        host: string
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
