import config from 'config'
import { createGameServer } from '#server/index'
import { serverCLI } from '#server/cli/index'

const { ws, cli } = config.server

createGameServer()
  .registerPlugin(serverCLI(cli.enabled))
  .listen(ws.port)
