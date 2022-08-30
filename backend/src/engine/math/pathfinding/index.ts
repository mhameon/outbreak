import { Coords } from '#engine/types'

export { Dijkstra } from '#engine/math/pathfinding/Dijkstra'

export type Node = {
  at: Coords
  weight: number
}

export const byLightWeightFirst = (a: Node, b: Node): number => a.weight - b.weight
export const byHeavyWeightFirst = (a: Node, b: Node): number => b.weight - a.weight
