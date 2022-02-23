import { Resolver } from '#engine/outbreak/resolver/Resolver'
import { CreatureType } from '#engine/outbreak/entities/CreatureManager'
import { random } from '#engine/math/index'
import { Dijkstra } from '#engine/math/pathfinding/Dijkstra'
import { WorldMap } from '#engine/map/WorldMap'

export class ZombieResolver extends Resolver {
  resolve (): void {
    this.log.profile('zombie')
    let zombiesMoved = 0

    const pathfinding = new Dijkstra(this.outbreak.map)
    const { distance, seed } = pathfinding.calculate([{ x: 6, y: 5 }, { x: 40, y: 15 }])

    // const m = matrix.create(this.outbreak.map.size, (x, y) => {
    //   return distance.get(WorldMap.index({ x, y })) ?? 99999
    // })
    //console.log(matrix.debug(m, { value: (v: number) => (v === 99999 ? ' ' : v.toString(36)) }))

    const zombies = this.outbreak.creature.get(CreatureType.Zombie)
    zombies.forEach((zombie) => {
      const costs = this.outbreak.map
        .getNeighborsCoords(zombie.at)
        .filter(here => {
          try {
            return this.outbreak.map.isWalkable(here)
          } catch (e) {
            return false
          }
        })
        .map(coords => ({ cost: distance.get(WorldMap.index(coords)) as number, at: coords }))
        .sort((a, b) => a.cost < b.cost ? -1 : 1)
      if (costs.length) {
        const minCosts = costs.filter(c => c.cost === costs[0].cost)

        this.outbreak.creature.move(zombie.id, random.choose(minCosts).at)
        zombiesMoved++
      } else {
        console.log('---- WTF??? ------')
        console.log({ zombie, costs })
      }
    })

    this.log.debug(`${zombiesMoved} zombies moved`)
    this.log.profile('zombie', { message: '🧟 Zombies turn resolved', level: 'debug' })
  }
}
