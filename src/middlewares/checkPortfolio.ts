import { doesPortfolioExists } from '../db/portfolio'
import { CustomRequestHandler } from '../types/CustomRequestHandler'
import { errorResponse } from '../utils/errorResponse'

type CheckPortfolio = (
  source: 'params' | 'body'
) => CustomRequestHandler<{ portfolio: string }, { portfolio: string }>

export const checkPortfolio: CheckPortfolio = source => async (
  req,
  res,
  next
) => {
  try {
    let portfolio
    if (source === 'body') portfolio = req.body.portfolio
    else portfolio = req.params.portfolio
    const exists = await doesPortfolioExists(portfolio)
    if (exists) next()
    else errorResponse(res, 400, "Portfolio doesn't exist")
  } catch (error) {
    errorResponse(res)
  }
}
