import { CommandLineInterface } from '@server/service/cli/CommandLineInterface'
import config from 'config'
import { GameServer } from '@server/service/server/GameServer'

export function registerServerCommands (cli: CommandLineInterface, server: GameServer): void {
  cli
    .registerCommand('server:start', 'Start server listening', (port: number = config.get('server.port')) => {
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
      if (status.started) {
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
}
