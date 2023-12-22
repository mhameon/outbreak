import { default as corsMiddleware, type CorsOptions } from 'cors'
import config from 'config'
import { getLogger } from '#common/logger'
import os from 'node:os'
import { isEnv } from '#common/helpers'

const ports = [ ...new Set([ config.server.http.port, config.server.ws.port ]) ] as const
const ips = [ ...Object.values(os.networkInterfaces()).flat().reduce<Set<string>>((ip, net) => {
  if (net?.family === 'IPv4') ip.add(net.address)
  return ip
}, new Set()) ] as const

export const allowedOrigins = [
  `${config.server.http.host}:${config.server.http.port}`,
  `${config.server.ws.host}:${config.server.ws.port}`,
  ...(isEnv('production') ? [] : ips.flatMap(ip => ports.map(port => `http://${ip}:${port}`)))
] as const

getLogger('cors').info('CORS allowed origins', { allowedOrigins })

export const corsOptions: CorsOptions = {
  credentials: true,
  // optionsSuccessStatus: 200,
  //  preflightContinue: true,
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true)
    }

    if (!allowedOrigins.includes(origin)) {
      return callback(
        new Error(`The CORS policy does not allow access from "${origin}"`), false
      )
    }

    return callback(null, true)
  }
}

// Handle Cross-origin resource sharing (CORS)
// FIXME proxy & CORS & Session storage & Security stuff
export const cors = corsMiddleware(corsOptions)
