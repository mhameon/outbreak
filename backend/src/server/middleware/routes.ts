import path from 'path'
import express from 'express'

const root = process.env.PWD ?? process.cwd()

const routes = express.Router()

// React app
routes.use('/', express.static(path.join(root, '../app/build')))
routes.use('/static', express.static(path.join(root, '../app/build/static')))

export default routes
