import type { Session as CustomSessionData } from '#shared/types'
import session from 'express-session'

declare global {
  namespace Express {
    interface Request {
      logId: string
    }

    interface Response {
      logId: string
      contentBody: string
    }
  }
}

declare module 'express-session' {
  interface SessionData extends CustomSessionData {
  }
}

declare module 'node:http' {
  interface IncomingMessage {
    session: session.Session & session.SessionData
    sessionID: string
  }
}
