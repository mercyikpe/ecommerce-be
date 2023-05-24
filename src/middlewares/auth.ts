// import jwt from "jsonwebtoken";
import dev from '../config'
import { verifyJsonWebToken } from '../util/token'
import createError from 'http-errors'
import User from '../models/userModel'
import { Request, Response, NextFunction, RequestHandler } from 'express'
interface UserT {
  name: string
  email: string
  password: string
  id: string
}
interface CustomRequest extends Request {
  id?: string // Add your custom property here
}
const isAuth = (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.headers.cookie) throw createError(404, 'no cookie found')
    const token = req.headers.cookie.split('=')[1]
    if (!token) throw createError(404, 'no token found')
    const decoded = verifyJsonWebToken(
      res,
      token,
      String(dev.app.jwtAuthorizationKey)
    ) as UserT
    if (!decoded) throw createError(403, 'Invalid Token')
    req.id = decoded.id
    next()
  } catch (error) {
    next(error)
  }
}

const isAdmin = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.id
    if (id) {
      const user = await User.findById(id)
      if (!user) throw createError(404, 'No user found with this id!')
      if (!user.isAdmin) throw createError(401, 'User is not an admin!')
      next()
    } else {
      throw createError(400, 'Please login!')
    }
  } catch (error) {
    next(error)
  }
}
export { isAuth, isAdmin }
