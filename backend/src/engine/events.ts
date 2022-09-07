import { Entity } from '#engine/outbreak/entities/types'
import { Coords, GameId, Tile, Tileset } from '#engine/types'
import { Outbreak } from '#engine/outbreak'

//-- Socket.io events --------------------------------------------------------------------------------------------------

/** @see /Outbreak/shared/events.ts */

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

export type WorldMapEvents = {
  'tile:added': { tile: Tile; at: Coords; originalTileset: Tileset }
} & {
  [key in `tile:${Tile}:added`]: { at: Coords; originalTileset: Tileset }
}

export type EntityManagerEvents = {
  'entity:spawned': Entity
  'entity:moved': { entity: Entity; from: Coords }
}

