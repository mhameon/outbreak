import { GameManager } from '#engine/game/GameManager'
import { Outbreak } from '#engine/outbreak/index'
import { registerGameControlCommands } from '#server/cli/command/game-control'
import { CommandLineInterface } from '#server/cli/CommandLineInterface'
import type { GameId, Nullable } from '#shared/types'

let currentGameId: Nullable<GameId> = null

export function registerGameCommands (cli: CommandLineInterface, game: GameManager): void {
  game.on(GameManager.game.is.deleted, (gameId) => {
    if (currentGameId === gameId) {
      console.log(`${gameId} deleted, automatically leave CLI interaction mode`)
      currentGameId = null
    }
  })

  const getOutbreak = (): Nullable<Outbreak> => {
    if (currentGameId) {
      return game.get(currentGameId)
    }
    console.warn('Please enters in CLI interaction mode with "game:enter" before use this command')
    return null
  }

  cli
    .registerCommand('game:create', 'Create a new game and go inside', createGame)
    .registerCommand('game:list', 'List in progress games', listGames)
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

  function createGame (gameId?: GameId): void {
    console.log('')
    selectGame(game.create(gameId))
    displayMap()
  }

  function selectGame (gameId: GameId): void {
    if (currentGameId === null) {
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
    if (currentGameId !== null) {
      console.log(`Successfully leave the CLI interaction mode with "${currentGameId}"`)
      currentGameId = null
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
