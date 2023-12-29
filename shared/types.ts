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

export type SerializedMap = any

export type GameState = {
  id: GameId
  turn: number
  map: SerializedMap
}

export const LOBBY = 'lobby' as const
export type Room = GameId | typeof LOBBY

export interface Session {
  user: {
    id: string
    name: string
  }
  room?: Room
}

export interface ClientSessionData {
  name: Session['user']['name']
  room?: Session['room']
}
