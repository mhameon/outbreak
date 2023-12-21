import path from 'path'
import express, { Router } from 'express'
import { AuthController } from '#server/http/controller/AuthController'
import { isAuthenticated } from '#server/http/middleware'

function group (callback: (router: Router) => void): Router {
  const router = express.Router()
  callback(router)
  return router
}

// eslint-disable-next-line @typescript-eslint/ban-types
// function controller (method: Function) {
//   return (req: Request, res: Response, next: NextFunction) => method(req, res, next).bind(method)
// }

const auth = new AuthController()

const root = process.env.PWD ?? process.cwd()

export const router = express.Router()
  // Serve React client app
  .use('/', express.static(path.join(root, '../app/build')))
  .use('/static', express.static(path.join(root, '../app/build/static')))

  // Serve API (Warning: GET requests are intercepted by client's `react-router`)
  .use('/api', group((api => {
    api.post('/login', auth.login)
    api.post('/logout', isAuthenticated, auth.logout)
    api.get('/session', isAuthenticated, auth.session)

    api.post('/hello', (req, res, next) => {
      return res.status(200).json({ hello: 'world' })
    })
  })))
