import { Resolver } from '#engine/outbreak/resolver/Resolver'
import { CreatureType, Creature, Attitude, CreatureManager } from '#engine/outbreak/entities/CreatureManager'
import { random, matrix } from '#engine/math/index'
import { Dijkstra, Node } from '#engine/math/pathfinding/Dijkstra'
import { WorldMap } from '#engine/map/WorldMap'
import { Direction, DirectionInDegree } from '#engine/types'
import { closestDirection } from '#engine/math/geometry'
import { ZombieIA } from '#engine/outbreak/entities/IA/ZombieIA'

const ignoreNode = 999999
const lightWeightFirst = (a: Node, b: Node): number => a.weight < b.weight ? -1 : 1

export class ZombieResolver extends Resolver {
  boot (): void {
    this.attribute = {
      ...this.attribute,
      ia: new ZombieIA(this.outbreak),
      pathfinding: new Dijkstra(this.map)
    }
  }

  resolve (): void {
    this.log.profile('zombie')
    let zombiesMoved = 0

    const targets = this.creature.get(CreatureType.Human).map(creature => creature.at)
    const dijkstraMap = this.attribute.pathfinding.calculateMap(targets)

    const m = matrix.create(this.map.size, (x, y) => {
      return dijkstraMap.distance.get(WorldMap.index({ x, y })) ?? ignoreNode
    })
    console.log(matrix.debug(m, {
      //display: (v: number) => (v === ignoreNode ? ' ' : v.toString(36)),
      heatmap: { ignore: [ ignoreNode ], colors: [ '#FFFF00', '#FF1700', '#0002E1' ] },
    }))

    const zombies = this.creature.get(CreatureType.Zombie)
    zombies.forEach((zombie) => {
      const previouslyAt = { ...zombie.at }

      const nodes: Array<Node> = this.map
        .getNeighborsCoords(zombie.at)
        .concat(zombie.at)
        .filter(here => {
          try {
            return this.map.isWalkable(here)
          } catch (e) {
            return false
          }
        })
        .map<Node>(coords => ({ at: coords, weight: dijkstraMap.distance.get(WorldMap.index(coords)) as number }))
        .sort(lightWeightFirst)

      let movedCreature: Creature | null
      const lowerWeight = nodes[0].weight
      if (lowerWeight <= 10) { // todo detection radius could be parameterizable
        zombie.attitude = Attitude.Tracking
        const minWeight: Node[] = nodes.filter(c => c.weight === lowerWeight)
        movedCreature = this.creature.move(zombie.id, random.choose(minWeight).at)
      } else {
        zombie.attitude = Attitude.Wandering
        let destination = zombie.facing
        let angle: number
        let attempt = 1
        while (attempt < 4 && !this.creature.canMove(zombie, destination)) {
          angle = DirectionInDegree[zombie.facing] - attempt * 45
          if (angle < 0) {
            angle = 360 + angle
          }
          destination = closestDirection(angle)

          if ( !this.creature.canMove(zombie, destination) ) {
            angle = DirectionInDegree[zombie.facing] + attempt * 45
            if (angle >= 360) {
              angle = angle - 360
            }
            destination = closestDirection(angle)
          }
          attempt++
        }

        movedCreature = this.creature.move(zombie.id, destination)
        if ( attempt >=4 ) {
          console.log(`${zombie.id} Zombie at ${zombie.at.x}, ${zombie.at.y} facing ${Direction[zombie.facing]} is stuck`)
        }
      }

      const hasMoved = movedCreature.at.x !== previouslyAt.x || movedCreature.at.y !== previouslyAt.y
      if (hasMoved) {
        zombiesMoved++
      }
    })

    this.log.debug(`${zombiesMoved} zombies moved`)
    this.log.profile('zombie', { message: '🧟 Zombies turn resolved', level: 'debug' })
  }
}
