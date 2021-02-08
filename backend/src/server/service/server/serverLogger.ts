import { getLogger } from '@shared/logger'
import util from 'util'
import { Socket } from 'socket.io'

const log = getLogger('GameServer')

function registerEventLogger (socket: Socket): void {
  socket.onAny((event, ...args) => {
    let has_ack = false
    const [ ack ] = args.slice(-1)
    if (ack instanceof Function) {
      has_ack = true
      args.pop()
    }
    log.http(
      '⚡ Receive event `%s`', event,
      { socketId: socket.id, event, args: util.inspect(args.length === 1 ? args[0] : args), has_ack },
    )
  })
}

export {
  log,
  registerEventLogger
}
