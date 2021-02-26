import { CommandLineInterface } from '@server/service/cli/CommandLineInterface'
import { GameManager } from '@engine/game/GameManager'
import { GameId } from '@engine/types'
import { Nullable } from '@shared/types'
import { Outbreak } from '@engine/outbreak'

let currentGameId: GameId = ''

export function registerGameCommands (cli: CommandLineInterface, game: GameManager): void {
  game.on('game:deletion', (gameId: GameId) => {
    if (currentGameId === gameId) {
      console.log(`${gameId} deleted, automatically leave CLI interaction mode`)
      currentGameId = ''
    }
  })

  const getOutbreak = (): Nullable<Outbreak> => {
    if (currentGameId) {
      return game.get(currentGameId)
    }
    console.log('Please enters in CLI interaction mode with "game:enter" before use this command')
    return null
  }

  cli
    .registerCommand('game:list', 'List in progress games', () => {
      const games = game.list()
      console.log('')
      if (games.length) {
        console.table(games.map(game => {
          const CLI = game.id === currentGameId ? '⬅️' : ''
          return { ...game, ...{ turn: game.turn || 'Not started', CLI } }
        }))
      } else {
        console.log('No game in progress ¯\\_(ツ)_/¯')
      }
      console.log('')
    })
    .registerCommand('game:create', 'Create a new game and go inside', () => {
      console.log('')
      const gameId = game.create()
      cli.executeCommand('game:enter', gameId)
      console.log('')
    })
    .registerCommand('game:enter', 'Enter in CLI interaction mode with gameId', (gameId: GameId) => {
      console.log('')
      if (currentGameId === '') {
        if (game.has(gameId)) {
          currentGameId = gameId
          console.log(`Successfully entered in CLI interaction mode with "${gameId}"`)
        } else {
          console.log(`Game "${gameId}" doesn't exist, please type a valid GameId`)
        }
      } else {
        console.log(`Already in CLI interaction mode with "${currentGameId}"${currentGameId !== gameId ? ', please "game:quit" first' : ''}`)
      }
      console.log('')
    })
    .registerCommand('game:quit', 'Leave CLI interaction mode', () => {
      console.log('')
      if (currentGameId !== '') {
        console.log(`Successfully leave the CLI interaction mode with "${currentGameId}"`)
        currentGameId = ''
      } else {
        console.log('Nothing happens, you\'re not in CLI interaction mode')
      }
      console.log('')
    })
    .registerCommand('game:show', 'Display map', () => {
      console.log('')
      const outbreak = getOutbreak()
      if (outbreak) {
        console.log(outbreak.render())
      }
      console.log('')
    })
    .registerCommand('game:turn', 'Resolve turn', () => {
      console.log('')
      const outbreak = getOutbreak()
      if (outbreak) {
        outbreak.resolveTurn()
        cli.executeCommand('game:show')
      }
      console.log('')
    })
}
