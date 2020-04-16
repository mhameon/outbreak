import config from 'config'
import winston from 'winston'

const outputFormat = winston.format.printf(line => {
  return `${line.timestamp} | ${line.level.padEnd(7)} | ${line.message}`
})

const log = winston.createLogger({
  level: config.get('logger.level'),
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    outputFormat
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  log.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
      outputFormat
    )
  }))
}

export default log
