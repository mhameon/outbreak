import type { GameState } from '#shared/types'
import { World as BaseWorld } from './engine/world/World'
import { Environment } from './world/Environment'
import { Ground } from './world/Ground'

export class World extends BaseWorld {
  //environment: Environment
  ground: Ground

  constructor () {
    super()
    //this.environment = new Environment()
    this.ground = new Ground()
  }

  onEvent (event: CustomEvent | MouseEvent) {
    console.log('onEvent', event)
    if (event instanceof CustomEvent) {
      switch (event.type) {
        case 'game:state':
          const { id, turn, size, map } = event.detail
          console.log(id, turn, size, map)
          break
        default:
          console.warn(`${event.type} unhandled CustomEvent`)
      }
    }
  }
}
