import { db } from './client'
import { getNextId } from './counter'

export type Holding = {
  ticker: string
  avgPrice: number
  amount: number
}

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
type CountTotalExcludingOneTrade = (trade: Trade) => Promise<number>
type GetAllTrades = (portfolio: string) => Promise<ReadonlyArray<Trade>>
type GetTrade = (trade: string) => Promise<Trade>
type GetHoldings = (portfolio: string) => Promise<ReadonlyArray<Holding>>
type DoesTradeExists = (trade: string) => Promise<boolean>
type DeleteTrade = (trade: string) => Promise<void>
type UpdateTrade = (
  trade: string,
  updates: Partial<Pick<Trade, 'amount' | 'price' | 'type'>>
) => Promise<void>

export const addTrade: AddTrade = async trade => {
  const id = await getNextId('TRADE')
  await db.collection<Trade>('trade').insertOne({
    id,
    ...trade
  })
  return id
}

export const getTrade: GetTrade = async trade => {
  return (await db
    .collection<Trade>('trade')
    .findOne({ id: trade }, { projection: { _id: 0 } })) as Trade
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
  // INFO:
  //   - filter with portfolio and ticker
  //   - create a multiplier variable 1 if type is BUY else -1
  //   - create sum based on amount and multiplier
  const result = await db
    .collection<Trade>('trade')
    .aggregate<{ _id: string; total: number }>([
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

export const getHoldings: GetHoldings = async portfolio => {
  // INFO:
  //     - filter using portfolio id
  //     - create a multiplier variable 1 if type is BUY else -1
  //     - group by ticker and get totalprice and totalamount
  //     - filter out any ticker with amount less than 1
  //     - get average price by totalprice / totalamount
  return await db
    .collection<Trade>('trade')
    .aggregate<Holding>([
      {
        $match: {
          portfolio
        }
      },
      {
        $project: {
          ticker: 1,
          amount: 1,
          price: 1,
          multiplier: {
            $cond: [{ $eq: ['$type', 'BUY'] }, 1, -1]
          }
        }
      },
      {
        $group: {
          _id: '$ticker',
          totalprice: {
            $sum: {
              $multiply: [{ $multiply: ['$multiplier', '$amount'] }, '$price']
            }
          },
          totalamount: {
            $sum: {
              $multiply: ['$multiplier', '$amount']
            }
          }
        }
      },
      {
        $match: {
          totalamount: {
            $gt: 0
          }
        }
      },
      {
        $project: {
          ticker: '$_id',
          _id: 0,
          amount: '$totalamount',
          avgPrice: {
            $divide: ['$totalprice', '$totalamount']
          }
        }
      }
    ])
    .toArray()
}

export const doesTradeExists: DoesTradeExists = async trade => {
  const count = await db
    .collection<Trade>('trade')
    .countDocuments({ id: trade })
  return count === 1
}

export const deleteTrade: DeleteTrade = async trade => {
  await db.collection<Trade>('trade').deleteOne({ id: trade })
}

export const countTotalExcludingOneTrade: CountTotalExcludingOneTrade = async (
  trade: Trade
) => {
  const result = await db
    .collection<Trade>('trade')
    .aggregate<{ _id: string; total: number }>([
      {
        $match: {
          portfolio: trade.portfolio,
          ticker: trade.ticker,
          id: {
            $ne: trade.id
          }
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

export const updateTrade: UpdateTrade = async (trade, updates) => {
  await db.collection<Trade>('trade').updateOne(
    { id: trade },
    {
      $set: updates
    }
  )
}
