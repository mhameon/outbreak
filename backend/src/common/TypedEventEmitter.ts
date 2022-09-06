import { EventEmitter as NodeEventEmitter } from 'events'

// Based on https://rjzaworski.com/2019/10/event-emitters-in-typescript

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventMap = Record<string, any>
export type EventKey<T extends EventMap> = string & keyof T
type EventListener<T> = (params: T) => void

interface Emitter<T extends EventMap> {
  on<K extends EventKey<T>> (eventName: K, listener: EventListener<T[K]>): void

  off<K extends EventKey<T>> (eventName: K, listener: EventListener<T[K]>): void

  emit<K extends EventKey<T>> (eventName: K, args: T[K]): void
}

export class EventEmitter<T extends EventMap> extends NodeEventEmitter implements Emitter<T> {
  on<K extends EventKey<T>> (eventName: K, listener: EventListener<T[K]>): this {
    return super.on(eventName, listener)
  }

  off<K extends EventKey<T>> (eventName: K, listener: EventListener<T[K]>): this {
    return super.off(eventName, listener)
  }

  emit<K extends EventKey<T>> (eventName: K, args: T[K]): boolean {
    return super.emit(eventName, args)
  }
}
