import config from 'config'
import { getLogger, Logger } from './logger'

let unlabeled: Logger
if ( config.get('logger.exception') ) {
  unlabeled = getLogger('Exception')
}

export abstract class CustomError extends Error {
  protected constructor (message?: string, logErrorWith = unlabeled?.error) {
    super(message)
    this.name = this.constructor.name
    if ( logErrorWith) {
      logErrorWith(message)
    }
  }
}
