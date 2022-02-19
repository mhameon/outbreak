/* eslint-disable @typescript-eslint/no-explicit-any */

import { Logger } from '#shared/logger/index'
import { Outbreak } from '#engine/outbreak/index'
import { Resolvable } from './index'
import { Bootable } from '#shared/types'

export abstract class Resolver implements Bootable, Resolvable {
  readonly log: Logger
  readonly outbreak: Outbreak

  constructor (outbreak: Outbreak) {
    this.log = outbreak.log.child({ label: this.constructor.name })
    this.outbreak = outbreak

    this.boot()
  }

  boot (): any {
    // boot() is called right after the class instantiation.
    // Does nothing by default but feel free to override.
  }

  abstract resolve (): void
}
