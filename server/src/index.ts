import 'module-alias/register'
import config from 'config'
import server from './server'
import runCommandLineInterpreter from './service/cli'

const port = config.get('server.port') as number

const cli = runCommandLineInterpreter(config.get('cli.enabled'))
if (cli) {
  cli.registerCommand('server:start', 'Start server listening', (customPort: number) => {
    server.listen(customPort || port)
  })
  cli.registerCommand('server:stop', 'Stop server listening',() => {
    server.close()
  })
}

server.listen(port)

