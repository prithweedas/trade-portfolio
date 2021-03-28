import Ajv, { JSONSchemaType } from 'ajv'
import { Portfolio } from '../db/portfolio'
import { Trade } from '../db/trade'
import { UpdateTradeRequestBody } from '../types/CustomRequestHandler'

export const ajv = new Ajv()

const createPortfolioRequestSchema: JSONSchemaType<Pick<Portfolio, 'name'>> = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 4,
      maxLength: 30,
      pattern: '^[A-Za-z0-9 ]+'
    }
  },
  required: ['name'],
  additionalProperties: false
}

const addTradeRequestSchema: JSONSchemaType<Omit<Trade, 'id'>> = {
  type: 'object',
  properties: {
    portfolio: {
      type: 'string',
      maxLength: 14,
      minLength: 14,
      pattern: '^PORTFOLIO[0-9]{5}$'
    },
    price: {
      type: 'number'
    },
    ticker: {
      type: 'string'
    },
    type: {
      type: 'string',
      enum: ['BUY', 'SELL']
    },
    amount: {
      type: 'integer',
      minimum: 1
    }
  },
  required: ['portfolio', 'price', 'ticker', 'type'],
  additionalProperties: false
}

const updateTradeRequestSchema: JSONSchemaType<UpdateTradeRequestBody> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    trade: {
      type: 'string'
    },
    amount: {
      type: 'integer',
      minimum: 1
    },
    price: {
      type: 'number'
    },
    type: {
      type: 'string',
      enum: ['BUY', 'SELL']
    }
  },
  required: ['trade'],
  anyOf: [
    {
      required: ['amount']
    },
    {
      required: ['price']
    },
    {
      required: ['type']
    }
  ]
}

// INFO: compile all schemas during startup
export const createPortfolioRequestValidator = ajv.compile(
  createPortfolioRequestSchema
)

export const addTradeRequestValidator = ajv.compile(addTradeRequestSchema)
export const updateTradeRequestValidator = ajv.compile(updateTradeRequestSchema)
