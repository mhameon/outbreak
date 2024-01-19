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

  static screenPixelRatio () {
    return Math.min(window.devicePixelRatio, 2)
  }

  #setSize () {
    this.#width = window.innerWidth
    this.#height = window.innerHeight
    this.#aspectRatio = this.#width / this.#height
    this.#pixelRatio = Display.screenPixelRatio()
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

  set pixelRatio (ratio: number) {
    if (ratio <= 0) {
      throw new Error('pixel ratio can\'t be less or equal than zero')
    }
    this.#pixelRatio = Math.min(ratio, Display.screenPixelRatio())
  }

  destroy () {
    window.removeEventListener('resize', this.#onResize.bind(this))
  }
}
