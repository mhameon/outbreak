export type Nullable<T> = T | null
export type Voidable<T> = T | void

export const GAME_ID_PREFIX = 'game_' as const
export type GameId = `${typeof GAME_ID_PREFIX}${string}`

export type Size = {
  width: number
  height: number
}

export type GameState = {
  turn: number,
  size: Size
}
