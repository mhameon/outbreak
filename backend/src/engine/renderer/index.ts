import MapRenderer from './MapRenderer'
import AsciiMapRenderer from './ascii/AsciiMapRenderer'

export type Renderer = 'Ascii' // | 'ThreeJS' | 'HTML'

type AbstractMapRenderer = typeof MapRenderer
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ConcreteMapRenderer extends AbstractMapRenderer {

}

type AvailableRenderers = Record<Renderer, ConcreteMapRenderer>

export { MapRenderer }
export const Renderers: AvailableRenderers = {
  'Ascii': AsciiMapRenderer,
  // 'ThreeJS': ThreeJSMapRenderer,
}

