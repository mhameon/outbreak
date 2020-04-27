export type Coords = {
  x: number
  y: number
}

export type Size = {
  width: number
  height: number
}

export const enum Tile {
  Walkable,
  Block,
  Road,
  Water,
}

export const enum Direction {
  North,
  West,
  South,
  East,
}
