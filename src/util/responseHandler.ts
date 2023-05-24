import { Response } from 'express'

export const successResponse = (
  res: Response,
  statusCode: number = 200,
  message: string = 'Success',
  data = {}
) => {
  return res.status(statusCode).send({
    success: true,
    message: message,
    data: data,
  })
}
