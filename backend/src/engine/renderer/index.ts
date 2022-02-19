import { AsciiMapRenderer } from './ascii/AsciiMapRenderer'
import { Renderable } from '#engine/renderer/MapRenderer'

export type Renderer = 'Ascii' // | 'ThreeJS' | 'HTML'

export const Renderers: Record<Renderer, () => Renderable> = {
  'Ascii': () => new AsciiMapRenderer(),
  // 'ThreeJS': ThreeJSMapRenderer,
}

