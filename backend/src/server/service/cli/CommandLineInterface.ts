import { getLogger } from '#shared/logger/logger'
import readline, { CompleterResult } from 'readline'
import { InvalidArgumentError } from '#shared/Errors'
import chalk from 'chalk'

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
  private executeNextCommandSilently = false

  constructor () {
    this.cli = readline
      .createInterface({
        input: process.stdin,
        output: process.stdout,
        completer: this.autocomplete.bind(this),
        prompt: ''
      })
      .on('line', async (input: string) => {
        input = input.trim()
        const args: string[] = input.split(' ')
        if (args.length >= 1) {
          const instruction = (args.shift() as string).toLowerCase()
          if (instruction) {
            if (this.registeredCommands.has(instruction)) {
              if (this.executeNextCommandSilently) {
                readline.moveCursor(process.stdout, 0, -1)
                readline.cursorTo(process.stdout, 0)
                process.stdout.clearLine(0)
              } else {
                log.verbose('💻 "%s"', input)
                this.executeNextCommandSilently = false
              }
              try {
                const command = this.registeredCommands.get(instruction) as CommandDescriptor
                await command.execute(...args)
              } catch (error) {
                this.print(error)
                this.executeCommand('help', instruction)
              }
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

  executeCommand (command: string, ...parameters: string[]): void {
    if (this.registeredCommands.has(command)) {
      this.executeNextCommandSilently = true
      this.cli.write(`${command}${parameters.length ? ' ' + parameters.join(' ') : ''}\r`)
    }
  }

  createAlias (alias: string, command: string): CommandLineInterface {
    const original = this.registeredCommands.get(command)
    if (original) {
      return this.registerCommand(alias, `Alias for ${command}`, (...args) => original.execute(...args))
    }
    throw new InvalidArgumentError(`Can't create alias for unknown command "${command}"`)
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
    this
      .registerCommand('exit', 'Send SIGINT signal', () => {
        this.cli.close()
      })
      .registerCommand('help', 'Show registered commands', (prefix = '') => {
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
                return optional ? `[${chalk.underline(parameter)}]` : `${chalk.underline(parameter)}`
              }).join(' ')} `
            }
            const space = (displayArgs.match(/ /g) || []).length
            console.log(`   ${(name + ' ' + displayArgs).padEnd(55 + space * 9, '·')} ${command.description}`)
          }
        }
        console.log('')
      })
      .createAlias('?', 'help')
  }

  private autocomplete (input: string): CompleterResult {
    const registeredCommandNames = [ ...this.registeredCommands.keys() ]
    const hits = registeredCommandNames.filter((command) => command.startsWith(input))

    // Show all availableCommands if none found
    return [ hits.length ? hits : registeredCommandNames, input ]
  }

  print (errorOrMessage: string | Error | unknown): void {
    console.log(
      errorOrMessage instanceof Error ? chalk.red(`❌ ${errorOrMessage.message}`) : 'Error',
      '\n',
      errorOrMessage
    )
  }
}
