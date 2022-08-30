import type { Tile } from '#engine/types'

const game = {
  join: 'game:join',
  leave: 'game:leave',
  deleted: 'game:deleted'
} as const

const tile = {
  added: 'tile:added'
  // + `tile:${Tile}:added` in TileEvent (below)
} as const

const entity = {
  spawned: 'entity:spawned',
  moved: 'entity:moved'
} as const

export const event = {
  ...{ game },
  ...{ tile },
  ...{ entity }
} as const

type ExtractEvents<T> = T[keyof T]
export type GameEvent = ExtractEvents<typeof game>
export type TileEvent = ExtractEvents<typeof tile> | `tile:${Tile}:added`
export type EntityEvent = ExtractEvents<typeof entity>
