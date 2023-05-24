import { Request, Response, NextFunction, RequestHandler } from 'express'
import { validationResult } from 'express-validator'

const runValidation: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).send({
        success: false,
        error: { message: errors.array()[0].msg },
      })
    }
    return next()
  } catch (error) {
    return next(error)
  }
}

export default runValidation
