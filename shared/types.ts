//-- Utils
export type Nullable<T> = T | null
export type Voidable<T> = T | void

//-- Game
export const GAME_ID_PREFIX = 'game_' as const
export type GameId = `${typeof GAME_ID_PREFIX}${string}`
export type Game = {
  id: GameId
  name: string
  players: number
  turn: number
}

//-- Map
export type Size = {
  width: number
  height: number
}

// Todo real typing
export type SerializedMap = any

export type GameState = {
  id: GameId
  turn: number
  map: SerializedMap
}

//-- User & Session
export type User = {
  id: string
  name: string
}

export type SocketId = string

export const LOBBY = 'lobby' as const
export type Room = GameId | typeof LOBBY

export type Player = {
  socket_id: SocketId
  room: Room
}

export interface Session {
  user: User
  /** @deprecated use player.room instead */
  room?: Room
  player?: Player
}

export interface ClientSessionData {
  name: Session['user']['name']
  room?: Session['room']
}
