import { default as sessionMiddleware } from 'express-session'
import type { SessionOptions } from 'express-session'
import { isEnv } from '#common/helpers'

// Define req.session
declare module 'express-session' {
  interface SessionData {
    name: string
    authenticated: boolean
  }
}

// declare module 'http' {
//   interface IncomingMessage {
//     session: Session & SessionData
//   }
// }

// FIXME session options, expiration, persistant storage, security...
const options: SessionOptions = {
  name: 'outbreak.sid',
  secret: 'changeit',
  resave: false,
  saveUninitialized: false,
  //cookie: { secure: false }
  //maxAge: ms
}

if (isEnv('production')) {
  options.cookie = { secure: true }
}

const session = sessionMiddleware(options)

export { session }
