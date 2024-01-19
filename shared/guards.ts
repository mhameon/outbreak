import { GAME_ID_PREFIX, type GameId } from './types'

export function isGameId (name: unknown): name is GameId {
  return typeof name === 'string' && name.startsWith(GAME_ID_PREFIX)
}

/**
 * Ensure unknown variable is an object
 */
export const isObject = (o: unknown): o is Record<string, any> => o !== null && typeof o === 'object'
