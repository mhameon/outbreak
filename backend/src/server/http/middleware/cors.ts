import { default as corsMiddleware, type CorsOptions } from 'cors'
import config from 'config'
import { getLogger } from '#common/logger'

const log = getLogger('cors')

export const corsOptions: CorsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    const app = `${config.server.http.host}:${config.server.http.port}`
    const ws = `${config.server.ws.host}:${config.server.ws.port}`

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    if ([ app, ws ].indexOf(origin) === -1) {
      const message = 'The CORS policy for this site does not allow access from the specified Origin.'
      log.error(message, { origin, app, ws })
      return callback(new Error(message), false)
    }
    return callback(null, true)
  }
}

// Handle Cross-origin resource sharing (CORS)
// FIXME proxy & CORS & Session storage & Security stuff
export const cors = corsMiddleware(corsOptions)
