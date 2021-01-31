import 'module-alias/register'
import config from 'config'
import server from './server'
import { runCommandLineInterpreter } from './service'

const defaultPort = config.get('server.port') as number

const cli = runCommandLineInterpreter(config.get('cli.enabled'))
if (cli) {
  cli.registerCommand('server:start', 'Start server listening', (port: number) => {
    server.listen(port || defaultPort)
  })
  cli.registerCommand('server:stop', 'Stop server listening', () => {
    server.close()
  })
}

server.listen(defaultPort)
