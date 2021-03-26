import { db } from './client'
import { getNextId } from './counter'

export type Trade = {
  id: string
  ticker: string
  price: number
  type: 'BUY' | 'SELL'
  portfolio: string
  amount: number
}

type AddTrade = (trade: Omit<Trade, 'id'>) => Promise<string>
type CountTotalQuantityInPortfolio = (
  portfolio: string,
  ticker: string
) => Promise<number>
type GetAllTrades = (portfolio: string) => Promise<ReadonlyArray<Trade>>

export const addTrade: AddTrade = async trade => {
  const id = await getNextId('TRADE')
  await db.collection<Trade>('trade').insertOne({
    id,
    ...trade
  })
  return id
}

export const getAllTrades: GetAllTrades = async portfolio => {
  const trades = await db
    .collection<Trade>('trade')
    .find(
      {
        portfolio: {
          $eq: portfolio
        }
      },
      {
        projection: { _id: 0 }
      }
    )
    .sort({ id: 1 })
    .toArray()
  return trades
}

export const countTotalQuantityInPortfolio: CountTotalQuantityInPortfolio = async (
  portfolio,
  ticker
) => {
  const result = await db
    .collection<Trade>('trade')
    .aggregate<{ _id: string; total: number }>([
      // INFO:
      //   - filter with portfolio and ticker
      //   - create a multiplier variable 1 if type is BUY else -1
      //   - create sum based on amount and multiplier
      {
        $match: {
          portfolio,
          ticker
        }
      },
      {
        $project: {
          ticker: 1,
          amount: 1,
          multiplier: {
            $cond: [{ $eq: ['$type', 'BUY'] }, 1, -1]
          }
        }
      },

      {
        $group: {
          _id: '$ticker',
          total: {
            $sum: {
              $multiply: ['$multiplier', '$amount']
            }
          }
        }
      }
    ])
    .toArray()
  if (result.length === 0) return 0
  else return result[0].total
}
