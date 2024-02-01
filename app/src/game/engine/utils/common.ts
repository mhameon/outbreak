import { Debug } from '../Debug'

export const log = (...args: any[]) => {
  if (Debug.enabled) {
    console.log(...args)
  }
}
