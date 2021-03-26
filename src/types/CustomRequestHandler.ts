import { RequestHandler } from 'express'

export type CustomRequestHandler<ReqBody> = RequestHandler<
  { [key: string]: string },
  unknown,
  ReqBody
>
