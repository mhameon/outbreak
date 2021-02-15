/* eslint-disable @typescript-eslint/no-explicit-any */

type Functions = Array<(...args: any[]) => any>

export const pipe = (value: any): any => (...pipeline: Functions) => {
  return pipeline.reduce((val, func) => func(val), value)
}
