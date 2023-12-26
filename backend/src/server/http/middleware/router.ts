import path from 'path'
import express, { Router, Response, Request } from 'express'
import { auth } from '#server/http/middleware/index'
import { login, logout, session } from '#server/http/controller/auth/index'
import { httpLogger } from '#server/http/middleware/http-logger'

const root = process.env.PWD ?? process.cwd()
const clientAppPath = path.join(root, '../app/build')

function group (route: (router: Router) => void): Router {
  const subRoutes = express.Router()
  route(subRoutes)
  return subRoutes
}

export const router = express.Router()
  // Rest API
  .post('/api/login', httpLogger, login)
  .use('/api', httpLogger, auth, group(api => {
    api.post('/logout', logout)
    api.get('/session', session)
  }))


  // React client app
  .use('/', express.static(clientAppPath))
  .use('/static', express.static(path.join(clientAppPath, '/static')))
  .get('/*', function (_req: Request, res: Response) {
    res.sendFile(path.join(clientAppPath, '/index.html'), (err) => {
      if (err) res.status(500).send(err)
    })
  })
