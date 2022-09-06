import { Plugin } from '#server/service/server'
import { GameServer } from '#server/service/server/GameServer'
import { CommandLineInterface } from './CommandLineInterface'
import { getLogger } from '#common/logger/logger'
import { registerServerCommands } from './command/server'
import { registerGameCommands } from './command/game'

const log = getLogger('CLI')

let cli: CommandLineInterface

// Usage: `serverCLI(true, server)` or `serverCLI(true)(server)`
// {@link https://medium.com/@FabriceTavilla/le-currying-en-javascript-cdcf98fae54e|Currying}
export function serverCLI (enabled: boolean, server?: GameServer): Plugin<CommandLineInterface> {
  if (!enabled) {
    log.info('🟥 The 💻 CLI is disabled')
    return
  }

  return server
    ? initializeCommandLineInterface(server)
    : (server: GameServer) => initializeCommandLineInterface(server)
}

function initializeCommandLineInterface (server: GameServer): CommandLineInterface {
  log.info('🟩 The 💻 CLI is enabled - type "help" for available commands')

  if (!cli) {
    cli = new CommandLineInterface()
    registerServerCommands(cli, server)
    registerGameCommands(cli, server.game)

    //-- Startup execution (debug purpose)
    cli.executeCommand('game:create')
    //cli.executeCommand('game:debug:at 3,3')
    cli.executeCommand('server:status')
  }
  return cli
}
