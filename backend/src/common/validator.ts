/* eslint-disable @typescript-eslint/no-explicit-any */
import { InvalidArgumentError } from '#common/Errors'

type TypeGuard = (args: any) => boolean
type TypeGuards = TypeGuard | Array<TypeGuard>

/**
 * @throws InvalidArgumentError
 */
export function validate (something: any, validators: TypeGuards, message?: string): any | never {
  const validatorsArray = ([] as TypeGuard[]).concat(validators)
  for (const validate of validatorsArray) {
    if (!validate(something)) {
      throw new InvalidArgumentError(message ?? `Argument validation fails with ${validate.name}`)
    }
  }
  return something
}
