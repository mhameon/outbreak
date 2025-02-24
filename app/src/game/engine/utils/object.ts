import { log } from './common'

export const isObject = (o: unknown): o is Record<string, any> => o !== null && typeof o === 'object'

export type ClassProperties<C> = {
  [K in keyof C as C[K] extends Function ? never : K]: C[K]
}

type TypeGuard<T> = (predicate: unknown, ...args: unknown[]) => predicate is T

/**
 * Returns an Iterator on all *public* properties of `that` object which is type guarded by `narrowedBy`
 */
export function* fetchPropertiesOf<T> (that: object, narrowedBy: TypeGuard<T>): Generator<T> {
  const properties = Object.keys(that)
  for (const property of properties) {
    const instance = (that as any)[property]
    if (narrowedBy(instance)) {
      yield instance
    }
  }
}

/**
 * Execute `callback` on each *public* property of `that` object which is type guarded by `narrowedBy`
 * @example
 * ```
 * forEachPropertyOf(this, implementsDestroyable, call => call.destroy())
 * ```
 * where `implementsDestroyable()` is a type guard
 */
export function forEachPropertyOf<T> (that: object, narrowedBy: TypeGuard<T>, callback: (o: T) => any): void {
  for (const property of fetchPropertiesOf(that, narrowedBy)) {
    console.log(property)
    //console.log(`xxx(${property as string})`)
    callback(property)
  }
}


/**
 * Delete all `attributes` of `that` object
 * @example `deleteAttributesOf` supports multiple parameters and/or array syntax
 * deleteAttributesOf(myObject, 'attribute1', 'attribute2', ...)
 * deleteAttributesOf(myObject, ['attribute1', 'attribute2'], ...)
 */
export function deleteAttributesOf<T extends object> (that: T, ...attributes: Array<keyof T> | Array<keyof T>[]) {
  attributes.flat().forEach(attribute => {
    if (!(attribute in that) && (that as any)[attribute] instanceof Function) {
      throw new Error(`${attribute.toString()} must be an attribute of ${that.constructor.name}`)
    }
    log(`deleteAttributes ${that.constructor.name}.${attribute.toString()}`)
    delete (that as any)[attribute]
  })
}
