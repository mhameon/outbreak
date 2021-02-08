/* eslint-disable @typescript-eslint/no-empty-interface */
import MapRenderer from './MapRenderer'
import AsciiMapRenderer from './ascii/AsciiMapRenderer'

export type Renderer = 'Ascii' // | 'ThreeJS'

type AbstractMapRenderer = typeof MapRenderer
interface ConcreteMapRenderer extends AbstractMapRenderer {
}

type AvailableRenderers = Record<Renderer, ConcreteMapRenderer>

export { MapRenderer }
export const Renderers: AvailableRenderers = {
  'Ascii': AsciiMapRenderer,
  // 'ThreeJS': ThreeJSMapRenderer,
}

