import type { Session as CustomSessionData } from '#shared/types'

declare global {
  namespace Express {
    interface Request {
      session: Express.Request.session & Express.session.Store
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
    session: Express.Request.session & Express.session.Store
    sessionID: string
  }
}
