import { getLogger } from '../'
import * as readline from 'readline'

const log = getLogger('CLI')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Command = (...args: any[]) => any

class CommandLineInterpreter {
  private readonly registeredCommands: Record<string, { execute: Command; description: string }> = {}
  private readonly cli: readline.Interface

  constructor () {
    this.registerDefaultCommands()

    this.cli = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: '' })
    this.cli.prompt()
    this.cli
      .on('line', (input: string) => {
        input = input.trim()
        const args: string[] = input.split(' ')
        if (args.length >= 1) {
          const command = (args.shift() as string).toLowerCase()
          if (command) {
            if (command in this.registeredCommands) {
              log.info('💻 "%s"', input)
              this.registeredCommands[command].execute(...args)
            } else {
              log.error('💻 "%s" command not found', command)
            }
          }
        }
      })
      .on('close', () => {
        process.kill(process.pid, 'SIGINT')
      })
  }

  registerCommand (name: string, description: string, command: Command): CommandLineInterpreter {
    name = name.toLowerCase()
    if (name in this.registeredCommands) {
      throw Error(`A command "${name}" is already registered`)
    }
    this.registeredCommands[name] = { execute: command, description }

    return this
  }

  private registerDefaultCommands (): void {
    this.registerCommand('help', 'Show registered commands', () => {
      const pad = 32
      console.log('')
      Object.entries(this.registeredCommands).sort().forEach(([ name, command ]) => {
        console.log(`  ${(name + ' ').padEnd(pad, '.')} ${command.description}`)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const args: string[] = (command.execute as any).toString()
          .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg, '')
          .match(/^\s*[^(]*\(\s*([^)]*)\)/m)[1]
          .split(/,/)

        if (args.filter(i => i).length) {
          console.log(`  ${''.padEnd(pad + 2)} Args: ${args.join(', ')}`)
        }
      })
      console.log('')
    })

    this.registerCommand('exit', 'Send SIGINT signal', () => {
      this.cli.close()
    })

    this.registerCommand('echo', 'Simply repeat input', (message?: string) => {
      console.log(`Echo: ${message ?? 'nothing'}`)
    })
  }
}

export default CommandLineInterpreter
