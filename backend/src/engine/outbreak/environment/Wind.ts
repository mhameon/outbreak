import { InvalidArgumentError } from '#common/Errors'
import { WindSettings } from '#engine/types'
import { validate } from '#common/validator'
import { closestDirection } from '#engine/math/geometry'
import { isNumber } from '#common/guards'

export class Wind {
  static readonly minForce = 0
  static readonly maxForce = 10
  static readonly rose = [ '↖', '↑', '↗', '←', '→', '↙', '↓', '↘' ] //[ '↑', '↗', '→', '↘', '↓', '↙', '←', '↖' ]

  #angle = 45
  #force = 5

  constructor (settings?: Partial<WindSettings>) {
    if (settings?.angle) {
      this.angle = settings.angle
    }
    if (settings?.force) {
      this.force = settings.force
    }
  }

  get angle (): number {
    return this.#angle
  }

  set angle (value: number) {
    validate(value, isNumber)
    this.#angle = value
  }

  get force (): number {
    return this.#force
  }

  set force (value: number) {
    validate(value, isNumber)
    if (value < Wind.minForce || value > Wind.maxForce) {
      throw new InvalidArgumentError(`Wind force must be between ${Wind.minForce} and ${Wind.maxForce}.`)
    }
    this.#force = value
  }

  get arrow (): string {
    return Wind.rose[closestDirection(this.angle)]
  }
}
