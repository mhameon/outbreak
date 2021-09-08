import { EventEmitter } from 'events'
import type { Coords, Index } from '@engine/types'
import { Logger } from '@shared/logger'
import { Outbreak } from '@engine/outbreak'
import { random } from '@engine/math'
import { WorldMap } from '@engine/map/WorldMap'
import { isCoords, isCreatureType, isCoordsArray } from '@engine/guards'
import { Nullable, Arrayable } from '@shared/types'
import { toArray } from '@shared/helpers'
import event from '@engine/events'

export type CreatureId = string

export enum CreatureType {
  'Zombie',
  'Survivor'
}


export interface Creature {
  id: CreatureId
  at: Coords
  type: CreatureType
}

/**
 * Handle creatures in an Outbreak and apply map constraints, lifecycle, etc.
 *
 * Emitted event:
 *
 * | Name                 | Handler signature               |
 * |----------------------|---------------------------------|
 * | `creature:spawned`   | (creature: Creature)            |
 */
export class CreatureManager extends EventEmitter {
  readonly log: Logger
  readonly outbreak: Outbreak
  private readonly creatures = new Map<CreatureId, Creature>()
  private readonly creatureIdsByCoords = new Map<Index, CreatureId[]>()
  private readonly creatureIdsByTypes = new Map<CreatureType, CreatureId[]>()

  constructor (outbreak: Outbreak) {
    super()
    this.log = outbreak.log.child({ label: this.constructor.name })
    this.outbreak = outbreak
  }

  spawn (type: CreatureType, at: Coords): Creature {
    this.outbreak.map.assertMapContains(at)

    const creature: Creature = { id: random.hex(), at, type }
    this.add(creature)

    this.log.info('Creature spawned %j', creature)
    this.emit(event.creature.spawned, creature)
    return creature
  }

  get (at: Coords, type?: Arrayable<CreatureType>): Array<Creature>
  get (type: CreatureType, at?: Arrayable<Coords>): Array<Creature>
  get (id: CreatureId[]): Array<Creature>
  get (id: CreatureId): Nullable<Creature>
  get (p1: Coords | CreatureType | CreatureId | CreatureId[], p2?: Arrayable<CreatureType> | Arrayable<Coords>): Nullable<Creature> | Array<Creature> {
    if (isCreatureId(p1)) {
      // get( CreatureId )
      return this.creatures.get(p1) ?? null
    } else if (isCoords(p1)) {
      // get( Coords )
      // get( Coords, CreatureType )
      // get( Coords, Array<CreatureType> )
      this.outbreak.map.assertMapContains(p1)
      const here = WorldMap.index(p1)
      const creatureIdsFromHere = this.creatureIdsByCoords.get(here)
      if (!creatureIdsFromHere) {
        return []
      }
      const creatures = this.get(creatureIdsFromHere)
      const types = toArray(p2)
      if (types.length > 0 && isCreatureType(types[0])) {
        return creatures.filter(({ type }) => types.includes(type))
      }
      return creatures
    } else if (isCreatureType(p1)) {
      // get( CreatureType )
      // get( CreatureType, Coords )
      // get( CreatureType, Array<Coords> )
      const creatureIdsByType = this.creatureIdsByTypes.get(p1)
      if (!creatureIdsByType) {
        return []
      }
      const creatures = this.get(creatureIdsByType)
      const coords = toArray(p2)
      if (isCoordsArray(coords)) {
        return creatures.filter(({ at }) => coords.find(({ x, y }) => (at.x === x && at.y === y)))
      }
      return creatures
    } else if (p1?.length > 0 && isCreatureId(p1[0])) {
      // get( Array<CreatureId> )
      return p1.flatMap(id => this.get(id) ?? [])
    }
    this.log.error('WTF?! get(%j, %j)', p1, p2)
    return null
  }

  private add (creature: Creature): void {
    this.creatures.set(creature.id, creature)

    const here = WorldMap.index(creature.at)
    const creatureIdsFromHere = this.creatureIdsByCoords.get(here)
    this.creatureIdsByCoords.set(here, creatureIdsFromHere ? [ ...creatureIdsFromHere, creature.id ] : [ creature.id ])

    const creatureIdsOfType = this.creatureIdsByTypes.get(creature.type)
    this
      .creatureIdsByTypes.set(creature.type, creatureIdsOfType ? [ ...creatureIdsOfType, creature.id ] : [ creature.id ])
  }

}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isCreatureId = (arg: any): arg is CreatureId => typeof arg === 'string'
