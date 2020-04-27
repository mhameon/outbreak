import WorldMap from '../map/WorldMap'
import { Renderers, Renderer, MapRenderer } from '../map/renderer'

class Outbreak {
  static useRenderer: Renderer = 'Ascii'

  readonly map: WorldMap
  private turn = 1
  private renderer: MapRenderer

  constructor (map: WorldMap) {
    this.map = map
    this.renderer = new Renderers[Outbreak.useRenderer](this.map)
  }

  get currentTurn (): number {
    return this.turn
  }

  resolveTurn (): void {
    this.turn++
  }

  render (): void {
    console.log(this.renderer.render())
  }
}

export default Outbreak
