export type Coords = {
  x: number
  y: number
}

export type Size = {
  width: number
  height: number
}

export const enum Tile {
  /*** Basic behaviours ***/
  Walkable,
  Block,
  /*** Kind of tile ***/
  Road,
  Water,
}

export const enum Direction {
  North,
  West,
  South,
  East,
}
