import type { Tile } from '@engine/types'

export const game = {
  join: 'game:join',
  leave: 'game:leave',
  deleted: 'game:deleted'
} as const

export const tile = {
  added: 'tile:added'
  // + `tile:${Tile}:added` in TileEvent
} as const

export const creature = {
  spawned: 'creature:spawned'
} as const

export default {
  ...{ game },
  ...{ tile },
  ...{ creature }
} as const

type ExtractEvents<T> = T[keyof T]
export type GameEvent = ExtractEvents<typeof game>
export type TileEvent = ExtractEvents<typeof tile> | `tile:${Tile}:added`
export type CreatureEvent = ExtractEvents<typeof creature>
