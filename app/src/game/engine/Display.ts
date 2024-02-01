import { EventDispatcher } from 'three'
import type { Destroyable } from './interface/Destroyable'

export interface DisplayEventMap {
  onResize: {}
}

export class Display extends EventDispatcher<DisplayEventMap> implements Destroyable {
  #width!: number
  #height!: number
  #aspectRatio!: number
  #pixelRatio!: number

  #resizeHandler = this.#onResize.bind(this)

  constructor () {
    super()
    this.#setSize()
    window.addEventListener('resize', this.#resizeHandler)
  }

  #setSize () {
    this.#width = window.innerWidth
    this.#height = window.innerHeight
    this.#aspectRatio = this.#width / this.#height
    this.#pixelRatio = Display.screenPixelRatio()
  }

  static screenPixelRatio () {
    return Math.min(window.devicePixelRatio, 2)
  }

  #onResize () {
    this.#setSize()
    this.dispatchEvent({ type: 'onResize' })
  }

  get width (): number {
    return this.#width
  }

  get height (): number {
    return this.#height
  }

  get aspectRatio (): number {
    return this.#aspectRatio
  }

  get pixelRatio (): number {
    return this.#pixelRatio
  }

  destroy () {
    window.removeEventListener('resize', this.#resizeHandler)
  }
}
