export type Nullable<T> = T | null
export type Void<T> = T | void

// Get the const values of any object
// @see https://fettblog.eu/tidy-typescript-avoid-enums/
export type Values<T> = T[keyof T]
