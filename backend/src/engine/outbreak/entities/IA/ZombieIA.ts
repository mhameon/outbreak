import { Outbreak } from '#engine/outbreak'
import { WorldMap } from '#engine/map/WorldMap'
import { CreatureManager, Creature } from '#engine/outbreak/entities/CreatureManager'


export class ZombieIA {
  readonly outbreak

  constructor (outbreak: Outbreak) {
    this.outbreak = outbreak
  }

  get creature():CreatureManager {
    return this.outbreak.creature
  }

  get map():WorldMap{
    return this.outbreak.map
  }

  move(zombie: Creature): Creature{

    return zombie
  }
}
