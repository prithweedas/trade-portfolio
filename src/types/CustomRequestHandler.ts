import { RequestHandler } from 'express'

export type CustomRequestHandler<
  ReqBody,
  ReqParams = { [key: string]: string }
> = RequestHandler<ReqParams, unknown, ReqBody>
