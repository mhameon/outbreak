import WorldMap from '../map/WorldMap'
import AsciiMapRenderer from '../map/renderer/ascii/AsciiMapRenderer'

class Outbreak {
  readonly map: WorldMap
  private turn = 1

  constructor (map: WorldMap) {
    this.map = map
  }

  get currentTurn (): number {
    return this.turn
  }

  resolveTurn (): void {
    this.turn++
  }

  render (): void{
    const renderer = new AsciiMapRenderer(this.map)
    console.log(renderer.render())
  }
}

export default Outbreak
