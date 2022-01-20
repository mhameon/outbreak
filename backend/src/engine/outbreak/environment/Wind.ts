import { InvalidArgumentError } from '@shared/Errors'
import { WindSettings } from '@engine/types'
import { validate } from '@shared/validator'
import { isNumber } from '@engine/guards'

export class Wind {
  static readonly minForce = 0
  static readonly maxForce = 10
  static readonly rose = [ '↑', '↗', '→', '↘', '↓', '↙', '←', '↖' ]

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
    const negativeAngle = this._angle < 0
    let direction = Math.floor(Math.abs(this._angle) / 45) + (Math.abs(this._angle) % 45 >= 22.5 ? 1 : 0)
    direction = direction >= 8 ? 0 : direction

    return Wind.rose[negativeAngle ? 8 - direction : direction]
  }
}
