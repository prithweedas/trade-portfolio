/* eslint-disable @typescript-eslint/no-var-requires*/
// INFO: creates required indexes and initializes counters

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { MongoClient } = require('mongodb')

const argv = yargs(hideBin(process.argv)).argv
const client = new MongoClient(argv.connection, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const counterCollection = async db => {
  const counter = db.collection('counter')
  const indexPromise = counter.createIndex({ name: 1 }, { unique: true })
  const insertPromise = counter.insertMany([
    {
      name: 'PORTFOLIO',
      value: 0
    },
    {
      name: 'TRADE',
      value: 0
    }
  ])
  await Promise.all([insertPromise, indexPromise])
}

const portfolioCollection = async db => {
  const portfolio = db.collection('portfolio')
  await portfolio.createIndex({ id: 1 }, { unique: true })
}
const tradeCollection = async db => {
  const trade = db.collection('trade')
  const idPromise = trade.createIndex({ id: 1 }, { unique: true })
  const portfolioIdPromise = trade.createIndex({ portfolio: 1 })
  await Promise.all([idPromise, portfolioIdPromise])
}

async function run() {
  try {
    await client.connect()
    const db = client.db(argv.database)
    const counterPromise = counterCollection(db)
    const portfolioPromise = portfolioCollection(db)
    const tradePromise = tradeCollection(db)
    await Promise.all([counterPromise, portfolioPromise, tradePromise])
    console.log('Done!')
  } catch (error) {
    console.log(error)
  } finally {
    await client.close()
    process.exit(0)
  }
}

run()
