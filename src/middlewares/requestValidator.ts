import { ValidateFunction } from 'ajv'
import { RequestHandler } from 'express'
import { errorResponse } from '../utils/errorResponse'

export const requestvalidator = (
  validator: ValidateFunction
): RequestHandler => {
  return (req, res, next) => {
    const valid = validator(req.body)
    console.log(validator.errors)
    if (valid) next()
    else errorResponse(res, 422, 'Invalid request body')
  }
}
