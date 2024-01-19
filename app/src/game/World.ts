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
}
