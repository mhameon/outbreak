import { WorldMap } from '#engine/map/WorldMap'
import type { Index, Coords } from '#engine/types'
import type { OneOrMany } from '#common/types'
import { toArray } from '#common/helpers'
import { expect } from '#common/Errors'
import { OutOfMapError } from '#engine/map/WorldMapErrors'
import { isCoords } from '#engine/guards'
import { Node } from '#engine/math/pathfinding/index'
import { getLogger, Logger } from '#common/logger/index'

type DistanceMap = Map<Index, number>
type SourceMap = Map<Index, Index>

/**
 * Graph search algorithm
 *
 * https://www.redblobgames.com/pathfinding/tower-defense/
 * https://www.redblobgames.com/pathfinding/distance-to-any/#region-growth
 */
export class Dijkstra {
  static ignoreNode = 999999 as const

  readonly world: WorldMap
  private log: Logger

  constructor (world: WorldMap) {
    this.world = world
    this.log = getLogger(this.constructor.name, { gameId: this.world.seeder?.seed })
  }

  /**
   * @param sources Sources with weight <0 are more attractive, >0 are less
   */
  calculateMap (sources: OneOrMany<Node | Coords>, detectionArea = 10): { distance: DistanceMap; predecessors: SourceMap } {
    //todo detectionArea should embedded in sources
    const goals = toArray(sources)

    const frontier = new Array<Coords>()
    const distance: DistanceMap = new Map()
    const predecessors: SourceMap = new Map()

    goals.forEach(start => {
      const { at, weight } = isCoords(start) ? { at: start, weight: 0 } : start
      if (!this.world.isWalkable(at)) {
        this.log.warn('Node unreachable', { at })
      }
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
          if ((distance.get(currentIndex) as number) < detectionArea) {
            // Todo weight "1" can be tweaked regarding this.world tiles
            distance.set(nextIndex, (distance.get(currentIndex) as number) + 1)
            predecessors.set(nextIndex, currentIndex)
            frontier.push(next)
          }
        }
      }
    }
    return { distance, predecessors }
  }

  /**
   * ```
   *   ↑
   * ← · →  Get direct walkable neighbors coords
   *   ↓
   * ```
   */
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

//game:9acd9f18583caaec71254289

//game:f8177d50cb75206cf3b083a3
