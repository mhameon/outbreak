import { randomBytes } from 'node:crypto'
import { getLogger } from '#common/logger'
import { Request, Response, NextFunction, Send } from 'express'

const log = getLogger('http')

export function httpLogger (req: Request, res: Response, next: NextFunction): void {
  req.logId = res.logId = randomBytes(16).toString('hex')

  log.http(`↘️  ${req.method} ${req.url}`, {
    logId: req.logId,
    ...(!!req.session && { sessionId: req.session?.id }),
    ...(Object.keys(req.body).length && { body: req.body }),
    ...(Object.keys(req.query).length && { query: req.query }),
    ...(Object.keys(req.params).length && { params: req.params }),
    //headers: req.headers,
  })


  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  res.send = interceptor(res, res.send)

  res.on('finish', () => {
    const body = res.contentBody !== '{}' ? JSON.parse(res.contentBody) : false

    log.http(`↖️  ${res.statusCode} ${body?.error ?? ''}`, {
      logId: res.logId,
      ...(body && { body }),
      //headers: res.getHeaders(),
    })
  })

  return next()
}

const interceptor = (res: Response, send: Send) => (content: string) => {
  res.contentBody = content
  res.send = send
  res.send(content)
}
