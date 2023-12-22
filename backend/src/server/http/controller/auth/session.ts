import { Request, Response, NextFunction } from 'express'
import { buildClientSession } from '#server/http/controller/auth/index'

export function session (req: Request, res: Response, next: NextFunction): void {
  if (req.sessionID && !!req.session) {
    res.status(200).json(buildClientSession(req.session))
    return
  }
  res.status(204).json({})
}

