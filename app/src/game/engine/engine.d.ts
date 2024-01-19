import type { Engine } from './Engine'

declare global {
  interface Window {
    engine: Engine | null
  }
}
