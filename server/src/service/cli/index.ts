import { CommandLineInterpreter } from './CommandLineInterpreter'
import { getLogger } from '../'

const log = getLogger('CLI')

let singleton: CommandLineInterpreter
export function runCommandLineInterpreter (enabled: boolean): CommandLineInterpreter | void {
  if (enabled) {
    log.info('🟢 The 💻 CLI is enabled - type "help" for available commands')
    if (singleton) {
      return singleton
    }
    singleton = new CommandLineInterpreter()
    return singleton
  }
  log.info(' 🔴 The 💻 CLI is disabled')
}
