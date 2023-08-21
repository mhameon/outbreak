import path from 'path'
import express from 'express'
import { getLogger } from '#common/logger'

const root = process.env.PWD ?? process.cwd()


// Serve React App
const staticRoutes = express.Router()
staticRoutes.use('/', express.static(path.join(root, '../app/build')))
staticRoutes.use('/static', express.static(path.join(root, '../app/build/static')))

// Backend API
const log = getLogger('Express')
const apiRoutes = express.Router()
apiRoutes.post('/login', (req, res, next) => {
  log.http(`${req.method} ${req.url}`, {
    req: {
      headers: req.headers,
      body: req.body,
      params: req.params,
      session: { id: req.sessionID, content: req.session }
    }
  })

  const name = `${req.body.login} :)`

  req.session.name = name
  req.session.authenticated = true

  req.session.save((err) => {
    if (err) return next(err)

    return res.status(200).json({ name })
    //return res.redirect('http://localhost:3000/play')
  })
})
apiRoutes.get('/hello', (req, res, next) => {
  return res.status(200).json({ hello: 'world' })
})

export { staticRoutes, apiRoutes }
