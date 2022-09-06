/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from '#common/TypedEventEmitter'
import type { EventKey, EventMap } from '#common/TypedEventEmitter'
import { getLogger } from './logger'
import util from 'util'

const log = getLogger('Node EventEmitter')

export class LoggableEventEmitter<T extends EventMap> extends EventEmitter<T> {
  emit<K extends EventKey<T>> (eventName: K, args: T[K]): boolean {
    log.debug(
      '⚡ Emit `%s`', eventName,
      { args: util.inspect(args.length === 1 ? args[0] : args) }
    )
    return super.emit(eventName, args)
  }
}
