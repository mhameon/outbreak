import { InvalidArgumentError } from '#common/Errors'
import { WindSettings } from '#engine/types'
import { validate } from '#common/validator'
import { isNumber } from '#engine/guards'
import { closestDirection } from '#engine/math/geometry'

export class Wind {
  static readonly minForce = 0
  static readonly maxForce = 10
  static readonly rose = [ '↖', '↑', '↗', '←', '→', '↙', '↓', '↘' ] //[ '↑', '↗', '→', '↘', '↓', '↙', '←', '↖' ]

  private _angle = 45
  private _force = 5

  constructor (settings?: Partial<WindSettings>) {
    if (settings?.angle) {
      this.angle = settings.angle
    }
    if (settings?.force) {
      this.force = settings.force
    }
  }

  get angle (): number {
    return this._angle
  }

  set angle (value: number) {
    validate(value, isNumber)
    this._angle = value
  }

  get force (): number {
    return this._force
  }

  set force (value: number) {
    validate(value, isNumber)
    if (value < Wind.minForce || value > Wind.maxForce) {
      throw new InvalidArgumentError(`Wind force must be between ${Wind.minForce} and ${Wind.maxForce}.`)
    }
    this._force = value
  }

  get arrow (): string {
    return Wind.rose[closestDirection(this.angle)]
  }
}
