import WorldMap from '../map/WorldMap'
import { Renderers } from '../renderer'
import { GameId } from '../types'

export class Outbreak {
  private static renderer = new Renderers.Ascii()

  readonly id: GameId
  readonly createdAt: Date
  readonly map: WorldMap
  private turn = 1

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
      + `Turn    : ${this.turn}\n`
      + `${Outbreak.renderer.render(this.map)}`
      + `\n${Outbreak.renderer.render(this.map.extract({ x: 2,y: 2 }, { width: 5, height: 5 }))}`
  }
}
