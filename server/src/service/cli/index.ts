import * as readline from 'readline'
import { getLogger } from '../'

const log = getLogger('CLI')
const log_fail = getLogger('CLI', 'fail_command')

export default (enabled: boolean): void => {
  if (!enabled) {
    log.info('❌️ CLI is disabled')
    return
  }
  log.info('✅ CLI is enabled')

  const cli = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const execute: Record<string, (...args: any[]) => any> = {
    exit: () => {
      cli.close()
    },
    say: (message?: string) => {
      console.log(`Say: ${message ?? 'Hello World !'}`)
    }
  }

  cli.prompt()
  cli.on('line', (input: string) => {
    const args: string[] = input.trim().split(' ')
    if (args.length >= 1) {
      const program = (args.shift() as string).toLowerCase()
      if (program) {
        if (program in execute) {
          execute[program](...args)
        } else {
          log_fail.debug('"%s" command not found', program)
        }
      }
    }
  })
  cli.on('close', () => {
    process.kill(process.pid, 'SIGINT')
  })
}
