import { default as sessionMiddleware, type SessionOptions } from 'express-session'
import { isEnv } from '#common/helpers'
import type { Request, NextFunction, Response } from 'express'
import config from 'config'

// FIXME session options, expiration, persistant storage, security...
const options: SessionOptions = {
  name: config.server.http.session.name,
  secret: 'changeit',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    //sameSite: 'strict',
    //expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    secure: isEnv('production'),
  },
  //maxAge: ms
}

const session = sessionMiddleware(options)

function isAuthenticated (req: Request, res: Response, next: NextFunction): void {
  if (req.sessionID && !!req.session?.user) {
    next()
    return
  }
  res.status(401).json({ error: 'Unauthorized' })
}

export {
  session,
  isAuthenticated
}
