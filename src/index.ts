import express from 'express'
import { db } from './db/client'
import { portfolioRouter } from './routes/portfolio'
import { tradeRouter } from './routes/trade'
import { errorResponse } from './utils/errorResponse'

const app = express()
const PORT = parseInt(process.env.PORT || '3000', 10)

const cleanup = () => {
  db.close()
  process.exit(0)
}

process.on('SIGTERM', cleanup)
process.on('SIGINT', cleanup)
process.on('uncaughtException', cleanup)

const init = async () => {
  try {
    await db.connect()
  } catch (error) {
    cleanup()
  }
  app.use(express.json())

  // TODO: setup some logging mechanism

  app.use('/portfolio', portfolioRouter)
  app.use('/trade', tradeRouter)
  // INFO: 404 handler
  app.use('*', (_, res) => {
    errorResponse(res, 404, 'Not Found')
  })
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server started on port ${PORT}`)
  })
}

init()
