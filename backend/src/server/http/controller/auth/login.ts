import type { Request, Response, NextFunction } from 'express'
import { buildClientSession } from '#server/http/controller/auth/session'

// TODO validation req.body.login
//  use Joi?
export function login (req: Request, res: Response, next: NextFunction): void {
  const name = `${req.body.login} :)`

  // TODO set session from DB (use repository)
  req.session.user = {
    id: name, // Fixme me use the name as unique id until we have DB
    name
  }

  res.status(200).json(buildClientSession(req.session))
}
