import { doesTradeExists } from '../db/trade'
import { CustomRequestHandler } from '../types/CustomRequestHandler'
import { errorResponse } from '../utils/errorResponse'

type CheckTrade = (
  source: 'params' | 'body'
) => CustomRequestHandler<{ trade: string }, { trade: string }>

export const checkTrade: CheckTrade = source => async (req, res, next) => {
  try {
    let trade
    if (source === 'body') trade = req.body.trade
    else trade = req.params.trade
    const exists = await doesTradeExists(trade)
    if (exists) next()
    else errorResponse(res, 400, "Trade doesn't exist")
  } catch (error) {
    errorResponse(res)
  }
}
