import { Router } from 'express'
import { createPortfolio, getPortfolio, Portfolio } from '../db/portfolio'
import { getAllTrades, getHoldings } from '../db/trade'
import { checkPortfolio } from '../middlewares/checkPortfolio'
import { requestvalidator } from '../middlewares/requestValidator'
import { CustomRequestHandler } from '../types/CustomRequestHandler'
import { errorResponse } from '../utils/errorResponse'
import { createPortfolioRequestValidator } from '../utils/validators'

const router: Router = Router()

const createPortfolioHandler: CustomRequestHandler<
  Pick<Portfolio, 'name'>
> = async (req, res) => {
  try {
    const { name } = req.body
    const id = await createPortfolio(name)
    res.status(200).json({
      success: true,
      portfolioId: id
    })
  } catch (error) {
    errorResponse(res)
  }
}

const getTradesHandler: CustomRequestHandler<
  unknown,
  {
    portfolio: string
  }
> = async (req, res) => {
  const { portfolio } = req.params
  const trades = await getAllTrades(portfolio)
  res.status(200).json({
    success: true,
    trades
  })
}

const consolidatedPortfolioHandler: CustomRequestHandler<
  unknown,
  {
    portfolio: string
  }
> = async (req, res) => {
  try {
    const { portfolio } = req.params
    const portfolioPromise = getPortfolio(portfolio)
    const holdingsPromise = getHoldings(portfolio)
    const [{ name }, holdings] = await Promise.all([
      portfolioPromise,
      holdingsPromise
    ])
    res.status(200).json({
      success: true,
      name,
      holdings
    })
  } catch (error) {
    errorResponse(res)
  }
}

router.post(
  '/',
  requestvalidator(createPortfolioRequestValidator),
  createPortfolioHandler
)
router.get('/trades/:portfolio', checkPortfolio('params'), getTradesHandler)
router.get(
  '/overview/:portfolio',
  checkPortfolio('params'),
  consolidatedPortfolioHandler
)

export const portfolioRouter = router
