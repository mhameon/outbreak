import { deleteAttributes } from './engine/utils/object'
import { World as AbstractWorld } from './engine/World'
import { Environment } from './world/Environment'
import { City } from './world/City'

export const BLOCK_SIZE = 10 as const

export class World extends AbstractWorld {
  mapBuilder: City
  environment: Environment

  constructor () {
    super()
    this.environment = new Environment()
    this.mapBuilder = new City()

  }

  onEvent (event: CustomEvent | MouseEvent) {
    console.log('onEvent', event)
    if (event instanceof CustomEvent) {
      switch (event.type) {
        case 'game:state':
          this.mapBuilder.setMap(event.detail)

          break
        default:
          console.warn(`${event.type} unhandled CustomEvent`)
      }
    }
  }

  destroy () {
    super.destroy()
    deleteAttributes([ 'environment' ], this)
  }
}
