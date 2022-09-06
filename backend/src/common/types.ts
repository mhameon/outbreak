export type Nullable<T> = T | null
export type Void<T> = T | void

// Get the const values of any object
// @see https://fettblog.eu/tidy-typescript-avoid-enums/
export type Values<T> = T[keyof T]

export type OneOrMany<T> = T | Array<T> | Set<T>

/**
 * The `Bootable` interface means the `boot()` method is called after `__construct()`
 */
export interface Bootable {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  boot (): any
}
