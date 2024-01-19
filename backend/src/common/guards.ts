/* eslint-disable @typescript-eslint/no-explicit-any */

export const isNumber = (n: any): n is number => !isNaN(+n)
