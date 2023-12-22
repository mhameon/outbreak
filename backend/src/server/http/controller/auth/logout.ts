import { Request, Response, NextFunction } from 'express'
import { getGameServer } from '#server/index'
import config from 'config'

export function logout (req: Request, res: Response, next: NextFunction): void {
  if (req.sessionID) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req.session.destroy((err: any) => {
      if (err) return next(err)
      getGameServer().disconnectClient(req.sessionID)
    })
  }

  res
    .clearCookie(config.server.http.session.name)
    .status(204)
    .json({})
}
