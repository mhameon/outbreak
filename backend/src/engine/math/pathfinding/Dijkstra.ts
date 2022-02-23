import { WorldMap } from '#engine/map/WorldMap'
import type { Index, Coords } from '#engine/types'
import type { OneOrMany } from '#shared/types'
import { toArray } from '#shared/helpers'

type DistanceMap = Map<Index, number>
type SourceMap = Map<Index, Index>

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

  // Todo Tweak params to allow a start weight != 0 for each "from" (or an option for all?)
  calculate (from: OneOrMany<Coords>): { distance: DistanceMap; seed: SourceMap } {
    const starts = toArray(from)

    const frontier = new Array<Coords>()
    const distance: DistanceMap = new Map()
    const seed: SourceMap = new Map()

    starts.forEach(start => {
      const index = WorldMap.index(start)
      frontier.push(start)
      distance.set(index, 0)
      seed.set(index, index)
    })

    while (frontier.length) {
      const current = frontier.shift() as Coords
      const currentIndex = WorldMap.index(current)
      for (const next of this.neighbors(current)) {
        const nextIndex = WorldMap.index(next)
        if (!distance.has(nextIndex)) {
          // Todo weight "1" can be tweaked regarding this.world tiles
          distance.set(nextIndex, 1 + (distance.get(currentIndex) as number))
          seed.set(nextIndex, currentIndex)
          frontier.push(next)
        }
      }
    }
    return { distance, seed }
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
        return false
      }
    })
  }
}
