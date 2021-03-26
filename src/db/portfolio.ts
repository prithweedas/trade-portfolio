// INFO: all operations related to portfolio

import { db } from './client'
import { getNextId } from './counter'

export type Portfolio = {
  id: string
  name: string
}

type CreatePortfolio = (name: string) => Promise<string>
type DoesPortfolioExists = (portfolio: string) => Promise<boolean>

export const createPortfolio: CreatePortfolio = async name => {
  const id = await getNextId('PORTFOLIO')
  await db.collection<Portfolio>('portfolio').insertOne({
    id,
    name
  })
  return id
}

export const doesPortfolioExists: DoesPortfolioExists = async portfolio => {
  const count = await db
    .collection<Portfolio>('portfolio')
    .countDocuments({ id: portfolio })
  return count === 1
}
