import { RequestHandler } from 'express'

export type CustomRequestHandler<
  ReqBody,
  ReqParams = { [key: string]: string }
> = RequestHandler<ReqParams, unknown, ReqBody>

export type UpdateTradeRequestBody = { trade: string } & (
  | { amount: number }
  | { type: 'BUY' | 'SELL' }
  | { price: number }
)
