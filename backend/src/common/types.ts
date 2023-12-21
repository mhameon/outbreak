// Get the const values of any object
// @see https://fettblog.eu/tidy-typescript-avoid-enums/
export type Values<T> = T[keyof T]

export type OneOrMany<T> = T | Array<T> | Set<T>

export type Primitive = string | boolean | number

/**
 * The `Bootable` interface means the `boot()` method is called after at the end of `construct()`
 */
export interface Bootable {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  boot (): any
}
