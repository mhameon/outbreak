import 'module-alias/register'
import config from 'config'
import { runCommandLineInterpreter, server } from './service'

const defaultPort: number = config.get('server.port')

const cli = runCommandLineInterpreter(config.get('cli.enabled'))
if (cli) {
  cli
    .registerCommand('server:start', 'Start server listening', (port = defaultPort) => {
      server.listen(port)
    })
    .registerCommand('server:stop', 'Stop server listening', () => {
      server.close()
    })
    .registerCommand('server:status', 'Display server status', () => {
      console.log(
        {
          env: process.env.NODE_ENV,
          memoryUsage: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} M`,
          uptime: +process.uptime().toFixed(3),
        },
        server.status,
      )
      if (server.status.clients.length) {
        console.table(server.status.clients, [ 'id', 'rooms' ])
      }
    })
}

server.listen(defaultPort)
