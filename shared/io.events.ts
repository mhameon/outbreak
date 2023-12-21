import type { GameId, Nullable, Game } from './types'

type AckWith<T> = (data: T) => void

export interface ClientToServerEvents {
  'player:join:game': (join: { requestedGameId?: Nullable<GameId> }, ack: AckWith<{ gameId: Nullable<GameId> }>) => void
  'player:leave:game': (gameId: GameId, ack: AckWith<{ ok: boolean }>) => void
}

export interface ServerToClientEvents {
  'server:shutdown': () => void
  'msg': (message: string) => void

  'game:created': (room: string, games?: Array<Game>) => void
  'game:state': (state: any) => void
}
