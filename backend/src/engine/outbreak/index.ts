import { WindSettings } from '#engine/types'
import { Size } from '#shared/types'

export { OutbreakFactory } from './OutbreakFactory'
export { Outbreak } from './Outbreak'

export type OutbreakOptions = {
  size: Size
  wind: WindSettings
}
