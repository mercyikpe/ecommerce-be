import jwt from 'jsonwebtoken'
import fs from 'fs'
import createError from 'http-errors'
import User from '../models/userModel'
import dev from '../config'
import bcrypt from 'bcryptjs'
import {
  genPassword,
  sendEmailWithNodeMailer,
  compPassword,
} from '../util/helper'
import { createJsonWebToken, verifyJsonWebToken } from '../util/token'
import { successResponse } from '../util/responseHandler'
import { Request, Response, NextFunction, RequestHandler } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import mongoose from 'mongoose'

interface UserT {
  name: string
  email: string
  password: string
  id: string
}

interface ProfileT {
  page: number
  limit: number
}

const registerUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      throw createError(400, 'Please fill all the fields!')

    if (password.length < 6)
      throw createError(400, 'Password should be atleast 6 characters!')

    const isExists: UserT | null = await User.findOne({ email })
    if (isExists)
      throw createError(
        400,
        `User already exists with email ${email}. Please sign in.`
      )

    const hashedPassword = await genPassword(password)

    const token = createJsonWebToken(
      { ...req.body, password: hashedPassword },
      String(dev.app.jwtSecretKey),
      '10m'
    )
    const emailData = {
      email,
      subject: 'Account Activation Email',
      html: `
      <h2> Hello ${name} . </h2>
      <p> Please click here to <a href="${dev.app.clientUrl}/api/users/activate/${token}" target=_blank">activate your account</a></p>
      `, // html body
    }
    sendEmailWithNodeMailer(emailData)
    successResponse(res, 201, `Verification email has been sent to ${email}.`, {
      token,
    })
    //res.status(201).json({message :`Verification email has been sent to ${email}.`})
  } catch (error) {
    next(error)
  }
}

const verifyEmail: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.body
    if (!token) throw createError(404, 'Token not found')

    const decoded = verifyJsonWebToken(
      res,
      token,
      String(dev.app.jwtSecretKey)
    ) as UserT
    const existingUser = await User.findOne({ email: decoded.email })
    if (existingUser)
      throw createError(409, 'This account is already activated!, please login')

    const newUser = new User({ ...decoded })

    const user = await newUser.save()
    if (!user) throw createError(400, 'account not created.')
    return successResponse(res, 201, 'Account activated!! Now, you can login.')
  } catch (error) {
    next(error)
  }
}

const loginUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      throw createError(400, 'email or password is missing!')

    if (password.length < 6)
      throw createError(400, 'Password should be minimum 6 characters')

    const user = await User.findOne({ email })

    if (!user)
      throw createError(
        400,
        `User does not exist with email ${email}. Please register.`
      )

    if (user.isBanned) throw createError(401, 'user is banned from login.')

    const isPasswordMatched = await compPassword(password, user.password)

    if (!isPasswordMatched)
      throw createError(401, 'email or password did not match')

    const token = createJsonWebToken(
      { id: user._id },
      String(dev.app.jwtAuthorizationKey),
      '90m'
    )
    if (req.cookies[`${user._id}`]) {
      req.cookies[`${user._id}`] = ''
    }
    res.cookie(String(user._id), token, {
      path: '/',
      expires: new Date(Date.now() + 1000 * 60 * 88),
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })

    return successResponse(res, 200, 'login successful!', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isBanned: user.isBanned,
      },
      token: token,
    })
  } catch (error) {
    next(error)
  }
}

const logoutUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const obj = req.cookies
    if (!req.cookies) throw createError(404, 'no cookie found')
    const obj1 = Object.values(obj)
    const token = obj1[0]
    if (!token) throw createError(404, 'no token found')
    const decoded: JwtPayload = jwt.verify(
      String(token),
      String(dev.app.jwtAuthorizationKey)
    ) as JwtPayload
    if (!decoded) throw createError(403, 'Invalid Token')
    if (req.cookies[`${decoded.id}`]) {
      req.cookies[`${decoded.id}`] = ''
    }
    res.clearCookie(`${decoded.id}`, {
      sameSite: 'none',
      secure: true,
    })
    return successResponse(res, 200, 'logout successful!')
  } catch (error) {
    next(error)
  }
}

const deleteUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const user = await User.findById(req.params.id)
    if (!user) throw createError(404, 'user is not found.')
    await User.findByIdAndDelete(id)
    return successResponse(res, 200, 'user is deleted successfully.')
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      next(createError(400, 'Invalid ID'))
      return
    }
    next(error)
  }
}

const getAllUsers: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 5 } = req.query as unknown as ProfileT
    const users = await User.find({ isAdmin: 0 })
      .limit(limit)
      .skip((page - 1) * limit)
      .select({ password: 0 })
      .sort({ createdAt: 1 })

    if (!users) throw createError(400, 'no users found')
    return successResponse(res, 200, 'all users returned', users)
  } catch (error) {
    next(error)
  }
}

const userProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) throw createError(404, 'User is not found.')
    return successResponse(res, 200, 'User was returned successfully!', {
      user,
    })
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      next(createError(400, 'Invalid ID'))
      return
    }
    next(error)
  }
}

const updateUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.params.email
    const { name }: UserT = req.body
    const user = await User.findOne({ email: email })
    if (!user) throw createError(404, `No user found with email ${email}`)
    const updateUser = await User.updateOne(
      { email },
      {
        $set: {
          name: name,
        },
      },
      { new: true }
    )
    if (!updateUser) throw createError(400, 'account name is not updated')

    return successResponse(res, 200, 'account name is updated', {
      updateUser,
    })
  } catch (error) {
    next(error)
  }
}
const forgetPassword: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      throw createError(404, 'email or password is missing!')
    if (password.length < 6)
      throw createError(400, 'Password should be minimum 6 characters')
    const user = await User.findOne({ email })
    if (!user)
      throw createError(
        400,
        `User does not exist with email ${email}. Please register.`
      )

    const hashedPassword = await genPassword(password)

    const token = createJsonWebToken(
      { email, password: hashedPassword },
      String(dev.app.jwtSecretKey),
      '10m'
    )

    const emailData = {
      email,
      subject: 'Pasword Reset Email',
      html: `
      <h2> Hello ${user.name} . </h2>
      <p> Please click here to <a href="${dev.app.clientUrl}/api/users/reset-password/${token}" target=_blank">reset your password</a></p>
      `, // html body
    }
    sendEmailWithNodeMailer(emailData)

    return successResponse(
      res,
      201,
      'Verification email has been sent to your email.',
      token
    )
  } catch (error) {
    next(error)
  }
}

const resetPassword: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.body
    if (!token) throw createError(404, 'Token is missing.')
    const decoded = verifyJsonWebToken(
      res,
      token,
      String(dev.app.jwtSecretKey)
    ) as UserT

    const { email, password } = decoded
    const isExists = await User.findOne({ email })
    if (!isExists)
      throw createError(400, `User does not exist with email ${email}`)
    const updateData = await User.updateOne(
      { email },
      {
        $set: {
          password: password,
        },
      }
    )
    if (!updateData) throw createError(400, 'reset password is not successful.')
    return successResponse(res, 200, 'password is reset successfully.', token)
  } catch (error) {
    next(error)
  }
}

const getRefreshToken: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.headers.cookie) throw createError(404, 'no cookie found')
    const oldToken = req.headers.cookie.split('=')[1]
    if (!oldToken) throw createError(404, 'no token found')
    const decoded = verifyJsonWebToken(
      res,
      oldToken,
      String(dev.app.jwtAuthorizationKey)
    ) as UserT
    if (!decoded) throw createError(403, 'Invalid Token....')

    const token = createJsonWebToken(
      { id: decoded.id },
      String(dev.app.jwtAuthorizationKey),
      '15m'
    )
    if (req.cookies[`${decoded.id}`]) {
      req.cookies[`${decoded.id}`] = ''
    }
    res.cookie(String(decoded.id), token, {
      path: '/',
      expires: new Date(Date.now() + 1000 * 60 * 2),
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    })
    return successResponse(res, 200, 'Refresh token was returned!', { token })
  } catch (error) {
    next(error)
  }
}

const banID: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) throw createError(404, `No user found with id ${id}`)
    const updateUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          isBanned: true,
        },
      },
      { new: true }
    )
    if (!updateUser) throw createError(400, 'user is not updated')

    return successResponse(res, 200, 'user is banned', {
      updateUser,
    })
  } catch (error) {
    next(error)
  }
}

const unbanID: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) throw createError(404, `No user found with id ${id}`)
    const updateUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          isBanned: false,
        },
      },
      { new: true }
    )
    if (!updateUser) throw createError(400, 'user is not unbanned')

    return successResponse(res, 200, 'user is unbanned', {
      updateUser,
    })
  } catch (error) {
    next(error)
  }
}

export {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  deleteUser,
  getAllUsers,
  userProfile,
  updateUser,
  forgetPassword,
  resetPassword,
  getRefreshToken,
  banID,
  unbanID,
}
