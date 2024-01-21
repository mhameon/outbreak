import { World as AbstractWorld } from './engine/World'
import { Environment } from './world/Environment'
import { Ground } from './world/Ground'

export class World extends AbstractWorld {
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

  destroy () {
  }
}
