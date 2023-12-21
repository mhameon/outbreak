import { PlayerId } from '#server/ws/GameServer'

export interface Serializable {
  serialize (playerId?: PlayerId): any //FIXME type it!
}
