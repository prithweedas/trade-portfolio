import { Router } from 'express'
import { createPortfolio, Portfolio } from '../db/portfolio'
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

router.post(
  '/',
  requestvalidator(createPortfolioRequestValidator),
  createPortfolioHandler
)

export const portfolioRouter = router
