import { Router } from 'express'
import {
  countTotalExcludingOneTrade,
  deleteTrade,
  getTrade,
  Trade,
  updateTrade
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

const updateTradeHandler: CustomRequestHandler<UpdateTradeRequestBody> = async (
  req,
  res
) => {
  try {
    const { trade: tradeId, ...updates } = req.body
    // INFO: price update
    if ('price' in updates) {
      await updateTrade(tradeId, updates)
      res.status(200).json({ success: true }).end()
      return
    }
    const trade = await getTrade(tradeId)
    // INFO: trade type update
    if ('type' in updates) {
      // INFO: No change
      if (updates.type === trade.type) {
        res.status(200).json({ success: true }).end()
        return
      }
      // INFO: no validation needed to change from SELL to BUY
      if (updates.type === 'BUY') {
        await updateTrade(tradeId, updates)
        res.status(200).json({ success: true }).end()
        return
      }
      if (updates.type === 'SELL') {
        const count = await countTotalExcludingOneTrade(trade)
        if (count - trade.amount >= 0) {
          await updateTrade(tradeId, updates)
          res.status(200).json({
            succes: true
          })
        } else {
          res.status(400).json({
            succes: false,
            error: 'Can not change this trade to SELL'
          })
        }
        return
      }
    }
    // INFO: amount of security update
    if ('amount' in updates) {
      const count = await countTotalExcludingOneTrade(trade)
      const multiplier = trade.type === 'BUY' ? 1 : -1
      if (count + updates.amount * multiplier >= 0) {
        await updateTrade(tradeId, updates)
        res.status(200).json({
          succes: true
        })
      } else {
        res.status(400).json({
          succes: false,
          error: `Can not change amount to ${updates.amount}`
        })
      }
      return
    }
  } catch (error) {
    errorResponse(res)
  }
}

router.patch(
  '/',
  requestvalidator(updateTradeRequestValidator),
  checkTrade('body'),
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
