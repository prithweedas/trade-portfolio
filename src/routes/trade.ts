import { Router } from 'express'
import { Trade } from '../db/trade'
import { checkPortfolio } from '../middlewares/checkPortfolio'
import { requestvalidator } from '../middlewares/requestValidator'
import { CustomRequestHandler } from '../types/CustomRequestHandler'
import { errorResponse } from '../utils/errorResponse'
import { addTradeRequestValidator } from '../utils/validators'

const router: Router = Router()

const addTradeHandler: CustomRequestHandler<Omit<Trade, 'id'>> = async (
  req,
  res
) => {
  try {
    res.status(200).json({
      success: true
    })
  } catch (error) {
    errorResponse(res)
  }
}

router.post(
  '/',
  requestvalidator(addTradeRequestValidator),
  checkPortfolio,
  addTradeHandler
)

export const tradeRouter = router
