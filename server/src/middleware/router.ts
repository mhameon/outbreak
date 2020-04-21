import path from 'path'
import express, { Request, Response } from 'express'

export default function addRoutes (app: express.Application) {
  const rootPath = process.env.PWD ?? process.cwd()

  console.log(path.join(rootPath, '../app/build'))

  app.use('/static', express.static(path.join(rootPath, '../app/build/static')))
  app.use('/', express.static(path.join(rootPath, '../app/build')))
  // app.get('/', (req: Request, res: Response) => res.sendFile(path.join(rootPath, '../app/build')))

  app.get('/raw', (req, res) => {
    res.sendFile(path.join(rootPath, 'public/index.html'))
  })

  app.get('/raw/js/socket.io.js', (req, res) => {
    const socketIoClient = path.join(
      path.dirname(require.resolve('socket.io-client/package.json')),
      `dist/socket.io.slim${process.env.NODE_ENV === 'production' ? '' : '.dev'}.js`
    )
    res.sendFile(socketIoClient)
  })

  return app
}
