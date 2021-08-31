import { CommandLineInterface } from '@server/service/cli/CommandLineInterface'
import { Outbreak } from '@engine/outbreak'
import { Nullable } from '@shared/types'

export function registerGameControlCommands (cli: CommandLineInterface, getOutbreak: () => Nullable<Outbreak>): void {
  cli.registerCommand('game:set:wind', 'Change wind settings', (angle: string, force?: string) => {
    const outbreak = getOutbreak()
    if (outbreak) {
      try {
        outbreak.wind.angle = parseInt(angle, 10)
        if (force) {
          outbreak.wind.force = parseInt(force, 10)
        }
      } catch (error) {
        cli.print(error)
      }
      cli.executeCommand('game:show')
    }
  })
}
