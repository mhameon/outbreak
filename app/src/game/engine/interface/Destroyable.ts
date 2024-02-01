import { isObject } from '../utils/object'

export interface Destroyable {
  destroy (): void
}

export const implementsDestroyable = (o: unknown): o is Destroyable => isObject(o) && 'destroy' in o
