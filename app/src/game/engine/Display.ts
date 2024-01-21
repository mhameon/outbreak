import { EventDispatcher } from 'three'

export interface DisplayEventMap {
  onResize: {}
}

export class Display extends EventDispatcher<DisplayEventMap> {
  #width!: number
  #height!: number
  #aspectRatio!: number
  #pixelRatio!: number

  constructor () {
    super()
    this.#setSize()
    window.addEventListener('resize', this.#onResize.bind(this))
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
    window.removeEventListener('resize', this.#onResize.bind(this))
  }
}
