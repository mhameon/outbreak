import { getLogger } from '#shared/logger/index'
import util from 'util'
import { Socket } from 'socket.io'

export const log = getLogger('GameServer')

export function registerSocketEventLogger (socket: Socket): void {
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

function extractRooms (socket: Socket): { room: Array<string> } {
  // To improve readability, we remove the (default) room named `socket.id`
  return { room: [ ...socket.rooms ].filter(r => r !== socket.id) }
}

function extractEventArguments (args: Array<unknown>): { args: string; has_ack: boolean } {
  let has_ack = false
  const [ ack ] = args.slice(-1)
  if (ack instanceof Function) {
    has_ack = true
    args.pop()
  }

  return { args: util.inspect(args.length === 1 ? args[0] : args), has_ack }
}
