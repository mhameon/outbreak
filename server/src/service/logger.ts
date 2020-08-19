import config from 'config'
import winston from 'winston'

const taggedLoggers: Record<string, winston.Logger> = {}

/**
 * Returns a ready to use logger based on Winston.
 * @see https://github.com/winstonjs/winston
 *
 * Logs levels available are: `error`, `warn`, `info`, `http`, `verbose`, `debug` and `silly`
 *
 * @param {string} [tag=default] Log tag or category
 * @param {string} [channel] If specified, logs will be write in `logs/<channel>.log` (in addition to default log file)
 * @return winston.Logger
 */
export default function getLogger (tag = 'default', channel?: string): winston.Logger {
  const outputFormat = winston.format.printf(line => {
    return `${line.timestamp} ${line.ms.padStart(7)} | ${(line.label ?? '').padEnd(16)} | ${line.level.padEnd(7)} | ${line.stack ?? line.message}`
  })

  let logger = taggedLoggers[tag]
  if (!logger) {
    const transports = [
      new winston.transports.File({ filename: 'logs/default.log' })
    ]
    if (channel) {
      transports.push(new winston.transports.File({ filename: `logs/${channel}.log` }))
    }

    logger = winston.loggers.add(tag, {
      level: config.get('logger.level'),
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.ms(),
        winston.format.splat(),
        winston.format.errors({ stack: true }),
        winston.format.label({ label: tag }),
        outputFormat
      ),
      transports
    })
    if (process.env.NODE_ENV !== 'production' && !channel) {
      logger.add(new winston.transports.Console({
        stderrLevels: [],
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
          winston.format.splat(),
          winston.format.ms(),
          winston.format.errors({ stack: true }),
          winston.format.label({ label: tag }),
          outputFormat
        )
      }))
    }
  }

  return winston.loggers.get(tag)
}
