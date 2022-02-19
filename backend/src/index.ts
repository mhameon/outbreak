import config from 'config'
import { createGameServer, serverCLI } from '#server/service/index'

const { port, cli } = config.server

createGameServer()
  .registerPlugin(serverCLI(cli.enabled))
  .listen(port)
