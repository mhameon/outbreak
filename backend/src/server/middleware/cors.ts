import { default as corsMiddleware } from 'cors'
import config from 'config'

// Handle Cross-origin resource sharing (CORS)
// FIXME proxy & CORS & Session storage & Security stuff
export const cors = corsMiddleware({
  credentials: true,
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    if ([ config.server.http.host ].indexOf(origin) === -1) {
      const message = 'The CORS policy for this site does not allow access from the specified Origin.'
      return callback(new Error(message), false)
    }
    return callback(null, true)
  }
})
