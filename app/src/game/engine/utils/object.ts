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
  for (const property of Object.keys(that)) {
    const instance = (that as any)[property]
    if (narrowedBy(instance)) {
      yield instance
    }
  }
}

/**
 * Execute `callback` for each *public* property of `that` object which is type guarded by `narrowedBy`
 */
export function forEachPropertyOf<T> (that: object, narrowedBy: TypeGuard<T>, callback: (o: T) => any): any {
  for (const property of fetchPropertiesOf(that, narrowedBy)) {
    console.log(property)
    //console.log(`xxx(${property as string})`)
    callback(property)
  }
}


/**
 * Delete all `attributes` of class `of`
 */
export function deleteAttributes<T extends object> (attributes: Array<keyof T>, of: T) {
  attributes.forEach(attribute => {
    if (!(attribute in of) && (of as any)[attribute] instanceof Function) {
      throw new Error(`${attribute.toString()} must be an attribute of ${of.constructor.name}`)
    }
    log(`deleteAttributes ${of.constructor.name}.${attribute.toString()}`)
    delete (of as any)[attribute]
  })
}
