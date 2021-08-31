import { InvalidArgumentError } from '@shared/Errors'
import { WindSettings } from '@engine/types'
import { validate } from '@shared/validator'
import { isNumber } from '@engine/map/guards'

export class Wind {
  static minForce = 0 as const
  static maxForce = 10 as const

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
}
