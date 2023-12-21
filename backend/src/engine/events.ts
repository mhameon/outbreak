import type { EntityManagerEvents } from '#engine/outbreak/entities/EntityManager'
import type { OutbreakEvents } from './outbreak/Outbreak'
import type { GameManagerEvents } from './game/GameManager'
import type { WorldMapEvents } from './map/WorldMap'

//-- Socket.io events --------------------------------------------------------------------------------------------------

/**
 * @see ClientToServerEvents
 * @see ServerToClientEvents
 */

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InterServerEvents {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SocketData {
}

//-- Node EventEmitter events ------------------------------------------------------------------------------------------

export type {
  EntityManagerEvents,
  GameManagerEvents,
  OutbreakEvents,
  WorldMapEvents,
}
