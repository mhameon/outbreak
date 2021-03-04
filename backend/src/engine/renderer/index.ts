import MapRenderer from './MapRenderer'
import AsciiMapRenderer from './ascii/AsciiMapRenderer'
import WorldMap from '@engine/map/WorldMap'

export type Renderer = 'Ascii' // | 'ThreeJS' | 'HTML'

type ConcreteMapRenderer = new (map?: WorldMap) => MapRenderer
type AvailableRenderers = Record<Renderer, ConcreteMapRenderer>

export { MapRenderer }
export const Renderers: AvailableRenderers = {
  'Ascii': AsciiMapRenderer,
  // 'ThreeJS': ThreeJSMapRenderer,
}

