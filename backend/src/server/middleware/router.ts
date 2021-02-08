import path from 'path'
import express from 'express'

const root = process.env.PWD ?? process.cwd()

const router = express.Router()

// React app
router.use('/', express.static(path.join(root, '../app/build')))
router.use('/static', express.static(path.join(root, '../app/build/static')))

export default router
