import { db } from '../db/client'
import { Portfolio } from '../db/portfolio'
import { Trade } from '../db/trade'
import { CustomRequestHandler } from '../types/CustomRequestHandler'
import { errorResponse } from '../utils/errorResponse'

export const checkPortfolio: CustomRequestHandler<
  Pick<Trade, 'portfolio'>
> = async (req, res, next) => {
  try {
    const { portfolio } = req.body
    const count = await db
      .collection<Portfolio>('portfolio')
      .countDocuments({ id: portfolio })
    if (count === 1) next()
    else errorResponse(res, 400, "Portfolio doesn't exist")
  } catch (error) {
    errorResponse(res)
  }
}
