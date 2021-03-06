import { Logger } from '@shared/logger'
import { Outbreak } from '@engine/outbreak'
import { Resolvable } from './index'

export abstract class Resolver implements Resolvable {
  readonly log: Logger
  readonly outbreak: Outbreak

  constructor (outbreak: Outbreak) {
    this.log = outbreak.log.child({ label: this.constructor.name })
    this.outbreak = outbreak
  }

  abstract resolve (): void
}
