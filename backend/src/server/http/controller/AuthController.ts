import { Request, Response, NextFunction } from 'express'
import { Controller } from '#server/http/controller/Controller'
import { getGameServer } from '#server/index'
import config from 'config'
import { SessionData } from 'express-session'
import { ClientSessionData } from '#shared/types'

export class AuthController extends Controller {
  constructor () {
    super()
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.session = this.session.bind(this)
  }

  // TODO validation req.body.login
  //  use Joi?
  login (req: Request, res: Response, next: NextFunction): void {
    const name = `${req.body.login} :)`

    // TODO set session from DB
    req.session.user = {
      name
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //req.session.save((err: any) => {
    //  if (err) return next(err)

    res.status(200).json(this.buildClientSession(req.session))
    //})
  }

  logout (req: Request, res: Response, next: NextFunction): void {
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

  session (req: Request, res: Response, next: NextFunction): void {
    if (req.sessionID && !!req.session) {
      res.status(200).json(this.buildClientSession(req.session))
      return
    }
    res.status(204).json({})
  }

  private buildClientSession (session: SessionData): ClientSessionData {
    return {
      name: session.user.name
    }
  }
}
