import { Entity } from '#engine/outbreak/entities/types'
import { Coords, GameId, Tile, Tileset } from '#engine/types'
import { Outbreak } from '#engine/outbreak'
import { Nullable } from '#common/types'


//-- Socket.io events --------------------------------------------------------------------------------------------------
export interface ClientToServerEvents {
  'player:join:game': (join: { requestedGameId?: GameId }, ack: (data: { gameId: Nullable<GameId> }) => void) => void
  'player:leave:game': (leave: { gameId: GameId }, ack: (data: { ok: boolean }) => void) => void
}

export interface ServerToClientEvents {
  'shutdown': () => void
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InterServerEvents {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SocketData {
}

//-- Node EventEmitter events ------------------------------------------------------------------------------------------
export type GameManagerEvents = {
  'game:created': Outbreak
  'game:deleted': GameId
}

export type OutbreakEvents = {
  'game:turn:resolved': { gameId: GameId; turn: number }
}

// Todo improve typing: 'tile:70000:added' works but this is not Tile value
export type WorldMapEvents = Record<`tile:${number}:added`, { at: Coords; originalTileset: Tileset }> & {
  'tile:added': { tile: Tile; at: Coords; originalTileset: Tileset }
  //[Tile: string]: { at: Coords; originalTileset: Tileset }
} //& Record<`tile:${keyof typeof Tile}:added`, { at: Coords; originalTileset: Tileset }>

export type EntityManagerEvents = {
  'entity:spawned': Entity
  'entity:moved': { entity: Entity; from: Coords }
}
