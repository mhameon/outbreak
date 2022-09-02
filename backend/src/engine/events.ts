import { Entity } from '#engine/outbreak/entities/types'
import { Coords, GameId, Tile, Tileset } from '#engine/types'
import { Outbreak } from '#engine/outbreak'
import { Nullable } from '#shared/types'


//-- Socket.io events --------------------------------------------------------------------------------------------------
export interface ClientToServerEvents {
  'player:join:game': ({ gameId: requestedGameId }: { gameId?: GameId }, ack: (data: { gameId: Nullable<GameId> }) => void) => void
  'player:leave:game': ({ gameId }: { gameId: GameId }, ack: (data: { ok: boolean }) => void) => void
}

export interface ServerToClientEvent {
  'shutdown': () => void
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InterServerEvents {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SocketData {
}

//-- Node EventEmitter events ------------------------------------------------------------------------------------------
export type EntityManagerEvents = {
  'entity:spawned': Entity
  'entity:moved': { entity: Entity; from: Coords }
}

export type GameManagerEvents = {
  'game:created': Outbreak
  'game:deleted': GameId
}

export type WorldMapEvents = {
  'tile:added': { tile: Tile; at: Coords; originalTileset: Tileset }
  // Todo improve typing: 'tile:70000:added' works but this is not Tile value
  [Tile: string]: { at: Coords; originalTileset: Tileset }
}

export type OutbreakEvents = {
  'game:turn:resolved': { gameId: GameId; turn: number }
}
