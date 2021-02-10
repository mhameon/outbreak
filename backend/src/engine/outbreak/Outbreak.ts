import WorldMap from '../map/WorldMap'
import { Renderers, Renderer, MapRenderer } from '../map/renderer'
import { GameId } from '../type/outbreak'

export class Outbreak {
  static useRenderer: Renderer = 'Ascii'

  readonly id: GameId
  readonly createdAt: Date
  readonly map: WorldMap
  private turn = 1
  private renderer: MapRenderer

  constructor (id: GameId, map: WorldMap) {
    this.id = id
    this.map = map
    this.createdAt = new Date()
    this.renderer = new Renderers[Outbreak.useRenderer](this.map)
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

  render (): void {
    console.log(this.renderer.render())
  }
}
