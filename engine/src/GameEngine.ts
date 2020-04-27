import Outbreak from './outbreak/Outbreak'
import OutbreakFactory from './outbreak/OutbreakFactory'

class GameEngine {
  private games: Map<string, Outbreak>

  constructor () {
    this.games = new Map()
  }

  createGame (name: string): Outbreak {
    const outbreak = OutbreakFactory.create()
    this.games.set(name, outbreak)
    console.log(`Game ${name} created`)
    return outbreak
  }
}

export default GameEngine
