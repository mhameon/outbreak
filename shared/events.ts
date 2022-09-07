import { GameId } from './types'

export interface ClientToServerEvents {
  'player:join:game': (args: { requestedGameId?: GameId }, ack: (data: { gameId: GameId | null }) => void) => void
  'player:leave:game': (args: { gameId: GameId }, ack: (data: { ok: boolean }) => void) => void
}

export interface ServerToClientEvents {
  'server:shutdown': () => void
  'msg': (message: string) => void
  'game:state': (state: any) => void
}
