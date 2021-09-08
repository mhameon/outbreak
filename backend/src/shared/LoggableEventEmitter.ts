/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'events'
import { getLogger } from './logger'

const log = getLogger('EventEmitter')

export class LoggableEventEmitter extends EventEmitter{
  emit(event: string | symbol, ...args: any[]): boolean{
    log.debug('⚡ Emit `%s`', event, { args })
    return super.emit(event, ...args)
  }
}
