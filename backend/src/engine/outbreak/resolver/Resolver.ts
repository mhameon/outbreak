/* eslint-disable @typescript-eslint/no-explicit-any */

import { Logger } from '#common/logger'
import { Outbreak } from '#engine/outbreak/index'
import { Resolvable } from './index'
import { Bootable } from '#common/types'
import { EntityManager } from '#engine/outbreak/entities/EntityManager'
import { WorldMap } from '#engine/map/WorldMap'

export abstract class Resolver implements Bootable, Resolvable {
  readonly log: Logger
  readonly outbreak: Outbreak
  embedded: Record<string, any>

  constructor (outbreak: Outbreak) {
    this.log = outbreak.log.child({ label: this.constructor.name })
    this.outbreak = outbreak
    this.embedded = {}

    this.boot()
  }

  get entity (): EntityManager {
    return this.outbreak.entity
  }

  get map (): WorldMap {
    return this.outbreak.map
  }

  boot (): any {
    // boot() is called right after the class instantiation.
    // Do nothing by default but feel free to override.
  }

  abstract resolve (): void
}
