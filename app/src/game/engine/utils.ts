export const isObject = (o: unknown): o is Record<string, any> => o !== null && typeof o === 'object'
