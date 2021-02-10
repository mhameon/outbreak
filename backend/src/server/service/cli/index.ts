import { Plugin } from '@server/service/server'
import { GameServer } from '@server/service/server/GameServer'
import config from 'config'
import { CommandLineInterface } from './CommandLineInterface'
import { getLogger } from '@shared/logger/logger'

const log = getLogger('CLI')

// Usage: `serverCLI(true, server)` or `serverCLI(true)(server)`
// {@link https://medium.com/@FabriceTavilla/le-currying-en-javascript-cdcf98fae54e|Currying}
export function serverCLI (enabled: boolean, server?: GameServer): Plugin<CommandLineInterface> {
  if (enabled) {
    if (server) {
      return initializeCommandLineInterface(server)
    }
    return (server: GameServer) => initializeCommandLineInterface(server)
  }
  log.info('🟥 The 💻 CLI is disabled')
}

let cli: CommandLineInterface

export function initializeCommandLineInterface (server: GameServer): CommandLineInterface {
  log.info('🟩 The 💻 CLI is enabled - type "help" for available commands')
  if (cli) {
    return cli
  }
  cli = new CommandLineInterface()
    .registerCommand('server:start', 'Start server listening', (port = config.get('server.port')) => {
      server.listen(port)
    })
    .registerCommand('server:stop', 'Stop server listening', () => {
      server.close()
    })
    .registerCommand('server:status', 'Display server status', () => {
      const status = server.status
      const program = {
        memoryUsage: (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
        uptime: Math.round(+process.uptime())
      }

      console.log('\n')
      console.log(`Server     Mem: ${program.memoryUsage} M     Uptime: ${program.uptime} s`)
      if ( status.started ){
        console.log(`Listening  Yes (since ${status.uptime}s)`)
      } else {
        console.log('Listening  No')
      }
      console.log(`${status.rooms.length} room(s)   ${status.rooms.join(', ')}`)
      console.log(`${status.clients.length} Connected client(s)`)
      if (status.clients.length) {
        console.table(status.clients, [ 'id', 'rooms' ])
      }
      console.log('\n')
    })
  return cli
}
