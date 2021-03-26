import { Router } from 'express'
import { Trade } from '../db/trade'
import { checkPortfolio } from '../middlewares/checkPortfolio'
import { requestvalidator } from '../middlewares/requestValidator'
import { CustomRequestHandler } from '../types/CustomRequestHandler'
import { errorResponse } from '../utils/errorResponse'
import { addTradeRequestValidator } from '../utils/validators'
import { addTrade, countTotalQuantityInPortfolio } from '../db/trade'

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

router.post(
  '/',
  requestvalidator(addTradeRequestValidator),
  checkPortfolio('body'),
  addTradeHandler
)

export const tradeRouter = router
