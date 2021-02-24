import { getLogger } from '@shared/logger/logger'
import * as readline from 'readline'

const log = getLogger('CLI')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Command = (...args: any[]) => any

export interface CommandDescriptor {
  name?: string
  description: string
  execute: Command
}

export class CommandLineInterface {
  private readonly registeredCommands = new Map<string, CommandDescriptor>()
  private readonly cli: readline.Interface

  constructor () {
    this.cli = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: '' })
    this.cli.prompt()
    this.cli
      .on('line', async (input: string) => {
        input = input.trim()
        const args: string[] = input.split(' ')
        if (args.length >= 1) {
          const instruction = (args.shift() as string).toLowerCase()
          if (instruction) {
            if (this.registeredCommands.has(instruction)) {
              log.verbose('💻 "%s"', input)
              const command = this.registeredCommands.get(instruction) as CommandDescriptor
              await command.execute(...args)
            } else {
              log.warn('💻 "%s" command not found', instruction)
            }
          }
        }
      })
      .on('close', () => {
        process.kill(process.pid, 'SIGINT')
      })

    this.registerDefaultCommands()
  }

  registerCommand (name: string, description: string, command: Command): CommandLineInterface {
    name = name.toLowerCase()
    if (this.registeredCommands.has(name)) {
      throw Error(`A command "${name}" is already registered`)
    }
    this.registeredCommands.set(name, { execute: command, description })
    return this
  }

  private registerDefaultCommands (): void {
    this.registerCommand('exit', 'Send SIGINT signal', () => {
      this.cli.close()
    })

    this.registerCommand('help', 'Show registered commands', (prefix = '') => {
      const pad = 45

      console.log('')
      for (const [ name, command ] of this.registeredCommands.entries()) {
        if (prefix === '' || name.startsWith(prefix)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const args: string[] = (command.execute as any).toString()
            .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg, '')
            .match(/^\s*[^(]*\(\s*([^)]*)\)/m)[1]
            .split(/,/)

          let displayArgs = ''
          if (args.filter(i => i).length) {
            displayArgs = `${args.map(arg => {
              const [ parameter, optional ] = arg.split('=')
              return optional ? `[${parameter}]` : `${parameter}`
            }).join(' ')} `
          }
          console.log(`   ${(name + ' ' + displayArgs).padEnd(pad, '·')} ${command.description}`)
        }
      }
      console.log('')
    })
  }
}
