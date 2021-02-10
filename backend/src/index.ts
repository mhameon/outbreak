// Todo find lib to replace @module/xxxx by real path
import 'module-alias/register'
import config from 'config'
import { initializeGameServer, serverCLI } from '@server/service'

const { port, cli } = config.server

initializeGameServer()
  .registerPlugin(serverCLI(cli.enabled))
  .listen(port)
