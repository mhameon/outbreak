import { isObject } from '../utils/object'

export interface Destroyable {
  destroy (): void
}

export const implementsDestroyable = (instance: unknown): instance is Destroyable => isObject(instance) && 'destroy' in instance
