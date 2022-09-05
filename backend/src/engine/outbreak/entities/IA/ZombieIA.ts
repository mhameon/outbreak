import { Outbreak } from '#engine/outbreak'
import { WorldMap } from '#engine/map/WorldMap'
import { EntityManager } from '#engine/outbreak/entities/EntityManager'
import { Dijkstra, byLightWeightFirst } from '#engine/math/pathfinding/index'
import type { Node } from '#engine/math/pathfinding/index'
import { matrix, random } from '#engine/math/index'
import { DirectionInDegree, Direction } from '#engine/types'
import { closestDirection } from '#engine/math/geometry'
import { Logger } from '#shared/logger'
import { Zombie, Entity, Attitude, EntityType } from '#engine/outbreak/entities/types'
import { expect } from '#shared/Errors'
import { OutOfMapError } from '#engine/map/WorldMapErrors'

export class ZombieIA {
  readonly log: Logger
  readonly outbreak: Outbreak
  readonly pathfinding: Dijkstra

  constructor (outbreak: Outbreak) {
    this.log = outbreak.log.child({ label: this.constructor.name })
    this.outbreak = outbreak
    this.pathfinding = new Dijkstra(this.map)
  }

  get entity (): EntityManager {
    return this.outbreak.entity
  }

  get map (): WorldMap {
    return this.outbreak.map
  }

  // todo store tracked EntityId in zombie Entity (zombie.target)
  // todo generalize tracking without hardcoded EntityType selection
  track (): void {
    const detectionArea = 10
    let movedZombies = 0
    let waitingZombies = 0

    const targets = this.entity.find({ type: EntityType.Human }).map(creature => creature.at)
    const dijkstraMap = this.pathfinding.calculateMap(targets, detectionArea)

    // -- debug -------
    const m = matrix.create(this.map.size, (x, y) => {
      return dijkstraMap.distance.get(WorldMap.index({ x, y })) ?? Dijkstra.ignoreNode
    })
    console.log(matrix.debug(m, {
      display: (v: number) => (v === Dijkstra.ignoreNode ? ' ' : v.toString(36)),
      heatmap: { colors: [ '#FFFF00', '#FF1700', '#0002E1' ], ignore: [ Dijkstra.ignoreNode ] },
    }))
    // -- end debug ---

    const zombies = this.entity.find<Zombie>({ type: EntityType.Zombie })
    zombies.forEach((zombie) => {
      const previouslyAt = { ...zombie.at }
      //const currentNodeWeight = dijkstraMap.distance.find(WorldMap.index(zombie.at)) ?? Dijkstra.ignoreNode

      const sortedNodes: Array<Node> = this.map
        .getNeighborsCoords(zombie.at, true)
        .reduce<Node[]>((nodes, at) => {
        try {
          if (this.map.isWalkable(at)) {
            const weight = dijkstraMap.distance.get(WorldMap.index(at))
            if (weight !== undefined) {
              nodes.push({ at, weight })
            }
          }
        } catch (error) {
          expect(error, OutOfMapError)
        }
        return nodes
      }, [])
        .sort(byLightWeightFirst)

      let movedCreature: Entity | null
      if (sortedNodes.length) {
        const lowerWeight = sortedNodes[0].weight
        // const lowerWeight2 = Math.min(...sortedNodes.reduce<number[]>((min, node) => {
        //   if (node.weight > lowerWeight && node.weight < currentNodeWeight) {
        //     min.push(node.weight)
        //   }
        //   return min
        // }, []))

        if (lowerWeight >= 0) {
          zombie.attitude = Attitude.Tracking

          const closerNodes: Node[] = sortedNodes.filter(c => c.weight === lowerWeight)
          //const closerNodes: Node[] = sortedNodes.filter(c => c.weight === lowerWeight || c.weight === lowerWeight2)
          // todo choose node regarding zombie.direction instead random
          // todo if the orientation doesn't match before moving, change the orientation and wait. Move will apply next turn
          movedCreature = this.entity.move(zombie.id, random.choose(closerNodes).at)
        } else {
          movedCreature = this.wander(zombie)
        }
      } else {
        movedCreature = this.wander(zombie)
      }

      const hasMoved = movedCreature.at.x !== previouslyAt.x || movedCreature.at.y !== previouslyAt.y
      if (hasMoved) {
        movedZombies++
      } else {
        waitingZombies++
      }
    })
    this.log.debug(`${movedZombies} zombie moved, ${waitingZombies} zombies wait`)
  }

  private wander (zombie: Zombie): Zombie {
    let destination = zombie.facing
    let angle: number
    let attempt = 1
    zombie.attitude = Attitude.Wandering
    while (attempt < 4 && !this.entity.canMove(zombie, destination)) {
      // Attempt on the left
      angle = DirectionInDegree[zombie.facing] - attempt * 45
      if (angle < 0) {
        angle = 360 + angle
      }
      destination = closestDirection(angle)

      // Attempt on the right
      if (!this.entity.canMove(zombie, destination)) {
        angle = DirectionInDegree[zombie.facing] + attempt * 45
        if (angle >= 360) {
          angle = angle - 360
        }
        destination = closestDirection(angle)
      }
      attempt++
    }

    if (attempt >= 4) {
      console.warn(`${zombie.id} Zombie at ${zombie.at.x}, ${zombie.at.y} facing ${Direction[zombie.facing]} is stuck`)
    }
    return this.entity.move<Zombie>(zombie.id, destination)
  }
}
