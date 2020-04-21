import config from 'config'
import winston from 'winston'

const outputFormat = winston.format.printf(line => {
  return `${line.timestamp} ${line.ms.padStart(7)} | ${line.level.padEnd(7)} | ${line.message}`
})

const logger = winston.createLogger({
  level: config.get('logger.level'),
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.splat(),
    winston.format.ms(),
    outputFormat
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/default.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
      outputFormat
    )
  }))
}

export default logger
