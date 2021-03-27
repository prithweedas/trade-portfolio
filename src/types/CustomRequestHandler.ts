import { RequestHandler } from 'express'

export type CustomRequestHandler<
  ReqBody,
  ReqParams = { [key: string]: string }
> = RequestHandler<ReqParams, unknown, ReqBody>

type UpdateTradeAmount = { trade: string; amount: number }
type UpdateTradeType = { trade: string; type: 'BUY' | 'SELL' }
type UpdateTradePrice = { trade: string; price: number }

export type UpdateTradeRequestBody =
  | UpdateTradeAmount
  | UpdateTradeType
  | UpdateTradePrice
