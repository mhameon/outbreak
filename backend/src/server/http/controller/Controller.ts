import { getLogger, type Logger } from '#common/logger'

export abstract class Controller {
  protected readonly log: Logger

  constructor () {
    this.log = getLogger(this.constructor.name)
  }
}
