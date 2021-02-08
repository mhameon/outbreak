import 'module-alias/register'
import config from 'config'
import { initializeGameServer, serverCLI } from '@server/service'

const server = initializeGameServer()

server.registerPlugin(serverCLI(config.get('server.cli.enabled')))
server.listen(config.get('server.port'))
