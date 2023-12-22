import path from 'path'
import express, { Router } from 'express'
import { isAuthenticated } from '#server/http/middleware/index'
import { login, logout, session } from '#server/http/controller/auth/index'

const root = process.env.PWD ?? process.cwd()

function group (callback: (router: Router) => void): Router {
  const router = express.Router()
  callback(router)
  return router
}

export const router = express.Router()
  // React client app
  .use('/', express.static(path.join(root, '../app/build')))
  .use('/static', express.static(path.join(root, '../app/build/static')))

  // Rest API
  .post('/api/login', login)
  .use('/api', isAuthenticated, group(api => {
    api.post('/logout', logout)
    api.get('/session', session)
  }))
