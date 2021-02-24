import WorldMap from '../map/WorldMap'
import { Renderers } from '../renderer'
import { GameId } from '../types'

export class Outbreak {
  private static renderer = new Renderers.Ascii()

  readonly id: GameId
  readonly createdAt: Date
  readonly map: WorldMap
  private turn = 0 // 0 means not started

  private players = new Map()

  constructor (id: GameId, map: WorldMap) {
    this.id = id
    this.map = map
    this.createdAt = new Date()
  }

  get name (): string {
    return this.map.name
  }

  get currentTurn (): number {
    return this.turn
  }

  resolveTurn (): number {
    return ++this.turn
  }

  render (): string {
    return ''
      + `Outbreak: ${this.id}  - ${this.createdAt.toISOString()}\n`
      + `Turn    : ${this.turn || 'Not started'}\n`
      + `${Outbreak.renderer.render(this.map)}`
      + `\n${Outbreak.renderer.render(this.map.extract({ x: 2,y: 2 }, { width: 5, height: 5 }))}`
  }

  joinPlayer(player:any):void{
    if ( this.turn === 0 ) {
      this.players.set(player.id, player)
    } else {
      // Game is already started
    }
  }
}
