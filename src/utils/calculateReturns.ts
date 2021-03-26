import { Holding } from '../db/trade'
import { getCurrentPrices } from './getCurrentPrices'

export const calculateReturns = async (
  holdings: ReadonlyArray<Holding>
): Promise<number> => {
  const tickers = holdings.map(holding => holding.ticker)
  const currentPrices = await getCurrentPrices(tickers)
  return holdings.reduce<number>((acc, curr) => {
    const returns = (currentPrices[curr.ticker] - curr.avgPrice) * curr.amount
    return acc + returns
  }, 0)
}
