import { getLogger } from '../'
import * as readline from 'readline'

const log = getLogger('CLI')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Command = (...args: any[]) => any

export class CommandLineInterpreter {
  private readonly registeredCommands: Record<string, { execute: Command; description: string }> = {}
  private readonly cli: readline.Interface

  constructor () {
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

    this.registerDefaultCommands()
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
      const pad = 40

      console.log('')
      Object.entries(this.registeredCommands).sort().forEach(([ name, command ]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const args: string[] = (command.execute as any).toString()
          .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg, '')
          .match(/^\s*[^(]*\(\s*([^)]*)\)/m)[1]
          .split(/,/)

        let allArguments = ''
        if (args.filter(i => i).length) {
          allArguments = `${args.map(arg => `<${arg}>`).join(' ')} `
        }
        console.log(`   ${(name + ' ' + allArguments).padEnd(pad, '.')} ${command.description}`)
      })
      console.log('')
    })

    this.registerCommand('exit', 'Send SIGINT signal', () => {
      this.cli.close()
    })
  }
}
