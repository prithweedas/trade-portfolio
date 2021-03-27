import { Router } from 'express'
import {
  countTotalExcludingOneTrade,
  deleteTrade,
  getTrade,
  Trade
} from '../db/trade'
import { checkPortfolio } from '../middlewares/checkPortfolio'
import { requestvalidator } from '../middlewares/requestValidator'
import {
  CustomRequestHandler,
  UpdateTradeRequestBody
} from '../types/CustomRequestHandler'
import { errorResponse } from '../utils/errorResponse'
import {
  addTradeRequestValidator,
  updateTradeRequestValidator
} from '../utils/validators'
import { addTrade, countTotalQuantityInPortfolio } from '../db/trade'
import { checkTrade } from '../middlewares/checkTrade'

const router: Router = Router()

const addTradeHandler: CustomRequestHandler<Omit<Trade, 'id'>> = async (
  req,
  res
) => {
  try {
    // TODO: check against a master if ticker passes is valid
    //       e.g. `TATA POWER XYZ` won't work
    const { type, ticker, portfolio, amount } = req.body
    if (type === 'SELL') {
      // INFO: check if there is enough of that ticker in holdings to sell
      const currentAmount = await countTotalQuantityInPortfolio(
        portfolio,
        ticker
      )
      if (currentAmount < amount) {
        errorResponse(res, 400, 'Amount is greater than current holding')
        return
      }
    }
    const tradeId = await addTrade(req.body)
    res.status(200).json({
      success: true,
      tradeId
    })
  } catch (error) {
    errorResponse(res)
  }
}

const deleteTradeHandler: CustomRequestHandler<
  unknown,
  { trade: string }
> = async (req, res) => {
  try {
    const trade = await getTrade(req.params.trade)
    if (trade.type === 'BUY') {
      // INFO: check if deleting this will make the net amount negetive for the ticker
      const count = await countTotalExcludingOneTrade(trade)
      if (count < 0) {
        errorResponse(res, 400, "Can't delete this trade")
        return
      }
    }
    await deleteTrade(trade.id)
    res.status(200).json({ success: true }).end()
  } catch (error) {
    errorResponse(res)
  }
}

const updateTradeHandler: CustomRequestHandler<
  UpdateTradeRequestBody,
  { trade: string }
> = (req, res) => {
  res.json({ success: true })
}

router.patch(
  '/',
  requestvalidator(updateTradeRequestValidator),
  // checkTrade('body'),
  updateTradeHandler
)

router.delete('/:trade', checkTrade('params'), deleteTradeHandler)

router.post(
  '/',
  requestvalidator(addTradeRequestValidator),
  checkPortfolio('body'),
  addTradeHandler
)

export const tradeRouter = router
