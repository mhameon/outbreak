import type { Request, Response, NextFunction } from 'express'
import type { SessionData } from 'express-session'
import type { ClientSessionData } from '#shared/types'

export const buildClientSession = (session: SessionData): ClientSessionData => ({
  name: session.user.name,
  room: session.room
})

export function session (req: Request, res: Response, next: NextFunction): void {
  if (req.sessionID && !!req.session) {
    res.status(200).json(buildClientSession(req.session))
    return
  }
  res.status(204).json({})
}
