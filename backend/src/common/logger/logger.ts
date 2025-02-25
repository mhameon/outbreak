import config from 'config'
import winston, { LogEntry } from 'winston'
import { DEFAULT_LOG_FILE } from '#common/logger'
import util from 'node:util'
import { isEnv } from '#common/helpers'

export type LogMethod = winston.LeveledLogMethod
export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly'

export interface Logger {
  error: LogMethod // Something goes wrong, not supposed to happen
  warn: LogMethod // Something fails but “it's expected/under control”
  info: LogMethod // Normal flow
  http: LogMethod // Network operations
  verbose: LogMethod //
  debug: LogMethod // Debug message
  silly: LogMethod //
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultMeta?: any

  profile (id: string | number, meta?: LogEntry): Logger

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  child (options: any): Logger
}

winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'blue',
  verbose: 'cyan',
  debug: 'white',
  silly: 'grey',
})

let logger: winston.Logger

/**
 * Get or set logger verbosity
 */
export function loggerVerbosity (level?: LogLevel): LogLevel {
  if (!logger) {
    return config.logger.level
  }
  if (level) {
    logger.level = level
  }
  return logger.level as LogLevel
}

/**
 * Returns a ready to use logger based on Winston.
 * @see https://github.com/winstonjs/winston
 *
 * Available logs levels are: `error`, `warn`, `info`, `http`, `verbose`, `debug` and `silly`
 *
 * @param label Log under this label
 * @param metadata Optional metadata added in logs. Useful for add context once.
 * @return winston.Logger
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLogger (label = 'default', metadata: Record<string, any> = {}): Logger {
  //todo allow option or something to target another log file than DEFAULT_LOG_FILE

  if (logger) {
    return logger.child({ label, ...metadata })
  }

  const { combine, splat, timestamp, errors, printf, ms, colorize, json } = winston.format
  logger = winston.createLogger({
    level: config.get('logger.level'),
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      dynamicLabel({ label }),
      splat(),
      errors({ stack: true }),
      printf(info => info.message),
      json(),
    ),
    transports: [
      new winston.transports.File({ filename: `logs/${DEFAULT_LOG_FILE}` })
    ],
  })

  if (!isEnv('production')) {
    logger.add(new winston.transports.Console({
      stderrLevels: [],
      format: combine(
        colorize({ all: true }),
        winston.format.metadata(),
        timestamp({ format: 'HH:mm:ss.SSS' }),
        ms(),
        splat(),
        errors({ stack: true }),
        printf(info => {
          // line.level.padEnd(17) instead of 7: level is colored in terminal, the extra length (10) is probably caused by that
          let message = `${info.timestamp} ${info.ms.padStart(7)} │ ${(info?.metadata.label ?? '').padEnd(17)} │ ${info.level.padEnd(17)} │ ${info.stack ?? info.message}`

          let maxWith = 0
          const metadata = Object.entries(info.metadata).filter(([ key ]) => {
            const keep = isNaN(+key) && ![ 'label', 'level', 'message', 'timestamp', 'ms' ].includes(key)
            if (keep) {
              maxWith = Math.max(maxWith, key.length)
            }
            return keep
          })

          if (metadata.length) {
            maxWith = Math.max(maxWith + 4, 16)
            const prefix = `${' '.padEnd(20)} │ ${' '.padEnd(17)} │ ${' '.padEnd(7)} │`
            const meta = metadata
              .map(([ key, value ], index) => {
                const stringWithNewlines = (typeof value === 'string' && value.indexOf('\n') !== -1)

                return `${prefix} ${(index + 1 < metadata.length) ? '├' : '└'}─ ${(key + ' ').padEnd(maxWith, '·')} ${util.inspect(value, {
                  compact: !stringWithNewlines,
                  //showHidden: true,
                  colors: true,
                  depth: 5,
                  breakLength: 80
                }).replace(/\r?\n/g, `\n${prefix}     ${' '.padEnd(maxWith, ' ')}`)}`
              })

            message += '\n' + meta.join('\n')
          }

          return message
        }),
      ),
    }))
  }

  return logger
}

const dynamicLabel = winston.format((info, opts) => {
  if (!info.label) {
    info.label = opts.label
  }
  return info
})
