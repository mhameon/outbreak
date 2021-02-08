import config from 'config'
import winston from 'winston'

const { combine, splat, timestamp, errors, printf, ms, colorize, metadata, json } = winston.format

export type LogMethod = winston.LeveledLogMethod

// todo use Logger interface to hide winston in getLogger(): Logger
export interface Logger {
  error: LogMethod // Something goes wrong, not supposed to happen
  warn: LogMethod // Something fails but “it's expected/under control”
  info: LogMethod // Normal flow
  http: LogMethod // Network operations
  verbose: LogMethod //
  debug: LogMethod //
  silly: LogMethod //
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultMeta?: any
}

winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'blue',
  verbose: 'cyan',
  debug: 'magenta',
  silly: 'grey',
})

let logger: winston.Logger

/**
 * Returns a ready to use logger based on Winston.
 * @see https://github.com/winstonjs/winston
 *
 * Logs levels available are: `error`, `warn`, `info`, `http`, `verbose`, `debug` and `silly`
 *
 * @param {string} [label=default] Log under this label
 * @return winston.Logger
 */
export function getLogger (label = 'default'): Logger {
  if (logger) {
    return logger.child({ label })
  }

  logger = winston.createLogger({
    level: config.get('logger.level'),
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      dynamicLabel({ label }),
      splat(),
      errors({ stack: true }),
      //printf(line => `${line.timestamp} ${line.ms.padStart(7)} │ ${(line.label ?? '').padEnd(16)} │ ${line.level.padEnd(7)} │ ${line.stack ?? line.message}`),
      printf(info => info.message),
      json(),
    ),
    transports: [
      new winston.transports.File({ filename: 'logs/default.log' }),
    ],
  })

  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      stderrLevels: [],
      format: combine(
        colorize({ all: true }),
        metadata(),
        timestamp({ format: 'HH:mm:ss.SSS' }),
        ms(),
        splat(),
        errors({ stack: true }),
        printf(info => {
          // line.level.padEnd(17) instead 7: level is colored in terminal, the extra length (10) may be due to that ?
          let message = `${info.timestamp} ${info.ms.padStart(7)} │ ${(info?.metadata.label ?? '').padEnd(16)} │ ${info.level.padEnd(17)} │ ${info.stack ?? info.message}`

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
            const prefix = `${' '.padEnd(20)} │ ${' '.padEnd(16)} │ ${' '.padEnd(7)} │`
            const meta = metadata
              .map(([ key, value ], index) => {
                return `${prefix} ${(index + 1 < metadata.length) ? '├' : '└'}─ ${(key + ' ').padEnd(maxWith, '·')} ${value}`
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
  //info.via='dynamicLabel'
  return info
})
