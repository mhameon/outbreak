import type { Request, Response, NextFunction } from 'express'
import { getLogger } from '#common/logger'

export function clientErrorHandler (err: Error, req: Request, res: Response, next: NextFunction): void {
  if (req.xhr) {
    getLogger('clientErrorHandler').error(err)
    res.status(500).json({ error: 'Something failed!' })
  } else {
    next(err)
  }
}

export function errorHandler (err: Error, req: Request, res: Response, next: NextFunction): void {
  getLogger('errorHandler').error(err)
  res.status(500).send()
  //res.render('error', { error: err }) // todo returns html template
}
