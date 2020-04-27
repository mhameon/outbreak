/* eslint-disable @typescript-eslint/no-empty-interface */
import MapRenderer from './MapRenderer'
import AsciiMapRenderer from './ascii/AsciiMapRenderer'

export type Renderer = 'Ascii' // | 'ThreeJS'

type AbstractMapRenderer = typeof MapRenderer

interface DerivedMapRenderer extends AbstractMapRenderer {
}

type AvailableRenderers = {
  [key in Renderer]: DerivedMapRenderer
}

export { MapRenderer }
export const Renderers: AvailableRenderers = {
  'Ascii': AsciiMapRenderer
}

