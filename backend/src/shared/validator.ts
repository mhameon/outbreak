/* eslint-disable @typescript-eslint/no-explicit-any */
import { InvalidArgumentError } from '@shared/Errors'

type TypeGuard = (args: any) => boolean

export function validate (something: any, ...validators: Array<TypeGuard>): any | never {
  for (const validate of validators) {
    if (!validate(something)) {
      throw new InvalidArgumentError(`Can't validate with ${validate.name}`)
    }
  }
  return something
}
