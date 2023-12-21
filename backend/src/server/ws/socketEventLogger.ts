import type { Logger } from '#common/logger'
import type { Socket } from 'socket.io'
import type { GameId } from '#engine/types'
import { isGameId } from '#engine/guards'

export function registerSocketEventLogger (socket: Socket, log: Logger): void {
  socket.onAny((event, ...args) => {
    log.http(
      '↘️  Receive event `%s`', event,
      {
        socketId: socket.id, event, ...extractRooms(socket), ...extractEventArguments(args)
      }
    )
  })

  socket.onAnyOutgoing((event, ...args) => {
    log.http(
      '↖️  Emit event `%s`', event,
      { socketId: socket.id, event, ...extractRooms(socket), ...extractEventArguments(args) },
    )
  })
}

function extractRooms (socket: Socket): { rooms: Array<string> } | { gameId: GameId } {
  // To improve readability, we remove the (default) room named `socket.id`
  const rooms = [ ...socket.rooms ].filter(r => r !== socket.id)
  if (rooms.length === 1 && isGameId(rooms[0])) {
    return { gameId: rooms[0] }
  }
  return { rooms: [ ...socket.rooms ] }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractEventArguments (args: Array<unknown>): { args: any; has_ack: boolean } {
  let has_ack = false
  const [ ack ] = args.slice(-1)
  if (ack instanceof Function) {
    has_ack = true
    args.pop()
  }

  return { args, has_ack }
}
