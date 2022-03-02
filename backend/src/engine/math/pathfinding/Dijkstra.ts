import { WorldMap } from '#engine/map/WorldMap'
import type { Index, Coords } from '#engine/types'
import type { OneOrMany } from '#shared/types'
import { toArray } from '#shared/helpers'
import { expect } from '#shared/Errors'
import { OutOfMapError } from '#engine/map/WorldMapErrors'
import { isCoords } from '#engine/guards'

type DistanceMap = Map<Index, number>
type SourceMap = Map<Index, Index>

export type Node = {
  at: Coords
  weight: number
}

/**
 * Graph search algorithm
 *
 * https://www.redblobgames.com/pathfinding/tower-defense/
 * https://www.redblobgames.com/pathfinding/distance-to-any/#region-growth
 */
export class Dijkstra {
  readonly world: WorldMap

  constructor (world: WorldMap) {
    this.world = world
  }

  calculateMap (points: OneOrMany<Node | Coords>): { distance: DistanceMap; predecessors: SourceMap } {
    const goals = toArray(points)

    const frontier = new Array<Coords>()
    const distance: DistanceMap = new Map()
    const predecessors: SourceMap = new Map()

    goals.forEach(start => {
      const { at, weight } = isCoords(start) ? { at: start, weight: 0 }: start
      const index = WorldMap.index(at)
      frontier.push(at)
      distance.set(index, weight)
      predecessors.set(index, index)
    })

    while (frontier.length) {
      const current = frontier.shift() as Coords
      const currentIndex = WorldMap.index(current)
      for (const next of this.neighbors(current)) {
        const nextIndex = WorldMap.index(next)
        if (!distance.has(nextIndex)) {
          // Todo weight "1" can be tweaked regarding this.world tiles
          distance.set(nextIndex, 1 + (distance.get(currentIndex) as number))
          predecessors.set(nextIndex, currentIndex)
          frontier.push(next)
        }
      }
    }
    return { distance, predecessors }
  }

  neighbors (at: Coords): Array<Coords> {
    return [
      { x: at.x, y: at.y - 1 },
      { x: at.x - 1, y: at.y },
      { x: at.x + 1, y: at.y },
      { x: at.x, y: at.y + 1 },
    ].filter(here => {
      try {
        return this.world.isWalkable(here)
      } catch (e) {
        expect(e, OutOfMapError)
        return false
      }
    })
  }
}
