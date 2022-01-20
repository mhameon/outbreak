import { EventEmitter } from 'events'
import type { Coords, Index } from '@engine/types'
import { Direction, DirectionInDegree } from '@engine/types'
import type { Logger } from '@shared/logger'
import { Outbreak } from '@engine/outbreak'
import { random } from '@engine/math'
import { WorldMap } from '@engine/map/WorldMap'
import { isCoords, isCreatureType, isCoordsArray } from '@engine/guards'
import { Nullable, OneOrMany } from '@shared/types'
import { toArray } from '@shared/helpers'
import event from '@engine/events'
import { NotFoundError, expect } from '@shared/Errors'
import assert from 'assert'
import { calculateDestination } from '@engine/math/geometry'
import { OutOfMapError } from '@engine/map/WorldMapErrors'

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
 * | Name                 | Handler signature                      |
 * |----------------------|----------------------------------------|
 * | `creature:spawned`   | (creature: Creature)                   |
 * | `creature:moved`     | ({ creature: Creature, from: Coords }) |
 */
export class CreatureManager extends EventEmitter {
  readonly log: Logger
  readonly outbreak: Outbreak
  private readonly creatures = new Map<CreatureId, Creature>()
  private readonly creatureIdsByCoords: Map<Index, Set<CreatureId>> = new Map()
  private readonly creatureIdsByTypes: Map<CreatureType, Set<CreatureId>> = new Map()

  constructor (outbreak: Outbreak) {
    super()
    this.log = outbreak.log.child({ label: this.constructor.name })
    this.outbreak = outbreak
  }

  spawn (type: CreatureType, at: Coords): Readonly<Creature> {
    this.outbreak.map.assertMapContains(at)

    const creature: Creature = { id: random.hex(), at, type }
    this.add(creature)

    this.log.info('Creature spawned %j', creature)
    this.emit(event.creature.spawned, creature)

    return creature
  }

  get (at: Coords, type?: OneOrMany<CreatureType>): Array<Creature>
  get (type: CreatureType, at?: OneOrMany<Coords>): Array<Creature>
  get (id: CreatureId[]): Array<Creature>
  get (id: CreatureId): Nullable<Creature>
  get (
    p1: Coords | CreatureType | CreatureId | CreatureId[],
    p2?: OneOrMany<CreatureType> | OneOrMany<Coords>
  ): Nullable<Creature> | Array<Creature> {
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
      if (!creatureIdsFromHere?.size) {
        return []
      }
      const creatures = this.get(toArray(creatureIdsFromHere))
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
      if (!creatureIdsByType?.size) {
        return []
      }
      const creatures = this.get(toArray(creatureIdsByType))
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

  move (id: CreatureId, toward: Direction): Creature {
    this.assertCreatureIdExists(id)
    const creature = this.get(id) as Creature
    const from = creature.at
    const destination = calculateDestination(creature.at, DirectionInDegree[toward], 1)

    try {
      if (this.outbreak.map.isWalkable(destination)) {
        this.delete(creature)
        creature.at = destination
        this.add(creature)
        this.emit(event.creature.moved, { creature, from } )
        return creature
      }
    } catch (error) {
      expect(error, OutOfMapError)
    }

    return creature
  }

  private add (creature: Creature): Creature {
    const here = WorldMap.index(creature.at)

    this.creatures.set(creature.id, creature)

    const creatureIdsFromHere = this.creatureIdsByCoords.get(here)
    if (creatureIdsFromHere) {
      creatureIdsFromHere.add(creature.id)
      this.creatureIdsByCoords.set(here, creatureIdsFromHere)
    } else {
      this.creatureIdsByCoords.set(here, new Set([ creature.id ]))
    }

    const creatureIdsOfType = this.creatureIdsByTypes.get(creature.type)
    if (creatureIdsOfType) {
      creatureIdsOfType.add(creature.id)
      this.creatureIdsByTypes.set(creature.type, creatureIdsOfType)
    } else {
      this.creatureIdsByTypes.set(creature.type, new Set([ creature.id ]))
    }
    return creature
  }

  /**
   * @return The creature that will be deleted
   */
  private delete (creature: Creature): void {
    this.creatures.delete(creature.id)

    const here = WorldMap.index(creature.at)
    const creatureIdsByCoords = this.creatureIdsByCoords.get(here)
    if (creatureIdsByCoords) {
      creatureIdsByCoords.delete(creature.id)
      if (creatureIdsByCoords.size) {
        this.creatureIdsByCoords.set(here, creatureIdsByCoords)
      } else {
        this.creatureIdsByCoords.delete(here)

      }
    }

    const creatureIdsByType = this.creatureIdsByTypes.get(creature.type)
    if (creatureIdsByType) {
      creatureIdsByType.delete(creature.id)
      if (creatureIdsByType.size) {
        this.creatureIdsByTypes.set(creature.type, creatureIdsByType)
      } else {
        this.creatureIdsByTypes.delete(creature.type)
      }
    }
  }

  assertCreatureIdExists (id: CreatureId): void {
    assert(this.creatures.has(id), new NotFoundError(id, 'CreatureId'))
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isCreatureId = (arg: any): arg is CreatureId => typeof arg === 'string'
