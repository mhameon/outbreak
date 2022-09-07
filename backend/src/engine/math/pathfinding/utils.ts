import { Node } from '#engine/math/pathfinding/types'

export const byLightWeightFirst = (a: Node, b: Node): number => a.weight - b.weight
export const byHeavyWeightFirst = (a: Node, b: Node): number => b.weight - a.weight
