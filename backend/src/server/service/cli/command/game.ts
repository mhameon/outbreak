import { CommandLineInterface } from '#server/service/cli/CommandLineInterface'
import { GameManager } from '#engine/game/GameManager'
import { GameId } from '#engine/types'
import { Nullable } from '#shared/types'
import { Outbreak } from '#engine/outbreak/index'
import { registerGameControlCommands } from '#server/service/cli/command/game-control'
import event from '#engine/events'

let currentGameId: GameId = ''

export function registerGameCommands (cli: CommandLineInterface, game: GameManager): void {
  game.on(event.game.deleted, (gameId: GameId) => {
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
    .registerCommand('game:list', 'List in progress games', listGames)
    .registerCommand('game:create', 'Create a new game and go inside', createGame)
    .registerCommand('game:enter', 'Enter in CLI interaction mode with gameId', selectGame)
    .registerCommand('game:quit', 'Leave CLI interaction mode', unselectGame)
    .registerCommand('game:show', 'Display map', displayMap)
    .registerCommand('game:turn', 'Resolve turn', resolveTurn)

  registerGameControlCommands(cli, () => getOutbreak())

  function listGames (): void {
    console.log('')
    const games = game.list()
    if (games.length) {
      console.table(games.map(game => {
        const CLI = game.id === currentGameId ? '⬅️' : ''
        return { ...game, ...{ turn: game.turn || 'Not started', CLI } }
      }))
    } else {
      console.log('No game in progress ¯\\_(ツ)_/¯')
    }
  }

  function createGame (): void {
    console.log('')
    selectGame(game.create())
    displayMap()
  }

  function selectGame (gameId: GameId): void {
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
  }

  function unselectGame (): void {
    if (currentGameId !== '') {
      console.log(`Successfully leave the CLI interaction mode with "${currentGameId}"`)
      currentGameId = ''
    } else {
      console.log('Nothing happens, you\'re not in CLI interaction mode')
    }
  }

  function displayMap (): void {
    console.log('')
    const outbreak = getOutbreak()
    if (outbreak) {
      console.log(outbreak.render())
    }
  }

  function resolveTurn (): void {
    console.log('')
    const outbreak = getOutbreak()
    if (outbreak) {
      outbreak.resolveTurn()
      displayMap()
    }
  }
}
