import type { WorldMap } from '../backend/src/engine/map/WorldMap'

export type Nullable<T> = T | null
export type Voidable<T> = T | void

export const GAME_ID_PREFIX = 'game_' as const
export type GameId = `${typeof GAME_ID_PREFIX}${string}`
export type Game = {
  id: GameId
  name: string
  players: number
  turn: number
}

export type Size = {
  width: number
  height: number
}

export type GameState = {
  id: GameId
  turn: number
  map: ReturnType<WorldMap['serialize']>
}

export interface Session {
  user: {
    name: string
  }
}

export interface ClientSessionData {
  name: Session['user']['name']
}
