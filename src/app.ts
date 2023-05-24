import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import bodyParser from 'body-parser'
import createError from 'http-errors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { Request, Response, NextFunction } from 'express'
import userRoutes from './routers/userRoutes'
import productRoutes from './routers/productRoutes'
import categoryRoutes from './routers/categoryRoutes'

import apiErrorHandler from './middlewares/apiErrorHandler'
import dev from './config'

dotenv.config({ path: '.env' })
const app = express()

// Express configuration
app.set('port', dev.app.serverPort)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
})
// Global middleware
app.use(
  cors({
    origin: [
      'https://ecommerce-fe-steel.vercel.app',
      'https://ecommerce-fe-git-main-mercyikpe.vercel.app',
      'https://ecommerce-rcmz85vvj-mercyikpe.vercel.app',
    ],
    // origin: ['http://localhost:3000'],
    credentials: true,
  })
)

app.use(cookieParser())
app.use('/public', express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Testing Successful!' })
})

app.use('/api/users', limiter, userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)

app.use((req, res, next) => {
  next(createError(404, 'Route not found!'))
})

type Error = {
  status: number
  message: string
}
//next
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res
    .status(err.status || 500)
    .json({ error: { status: err.status, message: err.message } })
})

export default app
