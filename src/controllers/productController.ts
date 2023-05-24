import Product from '../models/productModel'
import slugify from 'slugify'
import createError from 'http-errors'
import { Request, Response, NextFunction, RequestHandler } from 'express'
import { successResponse } from '../util/responseHandler'
import mongoose, { Document, Schema, model } from 'mongoose'

const createProduct: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      brand,
      category,
      description,
      reviews,
      rating,
      numReviews,
      price,
      countInStock,
    } = req.body
    const image = req.file
    if (!name || !brand || !category || !description || !image)
      throw createError(400, 'Please enter all fields!')
    const product = await Product.findOne({ name })
    if (product)
      throw createError(400, `Product already exists with name ${name}.`)
    if (req.file) {
      const newProduct = new Product({ ...req.body, image: req.file.path })
      const productData = await newProduct.save()
      if (!productData) throw createError(400, 'Product was not added!')
      successResponse(res, 201, 'Product was added successfully!', productData)
    }
  } catch (error) {
    next(error)
  }
}

const getAllProducts: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 3 } = req.query
    const products = await Product.find({})
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 })
    successResponse(res, 200, 'All products returned!', {
      products,
    })
  } catch (error) {
    next(error)
  }
}

const deleteProduct: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const product = await Product.findById(req.params.id)
    if (!product) throw createError(404, 'Product is not found.')
    await Product.findByIdAndDelete(id)
    return successResponse(res, 200, 'Product is deleted successfully.')
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      next(createError(400, 'Invalid ID'))
      return
    }
    next(error)
  }
}

const updateProduct: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const { name, brand, category, description, price, countInStock } = req.body
    const image = req.file
    const product = await Product.findById(id)
    if (!product) throw createError(404, `No product found with id ${id}`)
    if (image) {
      if (image.size > Math.pow(1024, 2))
        throw createError(400, 'File size too large!')
      const updateProduct = await Product.findByIdAndUpdate(
        id,
        {
          $set: {
            ...req.body,
            image: image.path,
          },
        },
        { new: true }
      )
      if (!updateProduct) throw createError(400, 'Product is not updated')
      return successResponse(res, 200, 'Product is updated', {
        updateProduct,
      })
    } else {
      const updateProduct = await Product.findByIdAndUpdate(
        id,
        {
          $set: {
            ...req.body,
          },
        },
        { new: true }
      )
      if (!updateProduct) throw createError(400, 'Product is not updated')
      return successResponse(res, 200, 'Product is updated', {
        updateProduct,
      })
    }
  } catch (error) {
    next(error)
  }
}

const getSingleProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const product = await Product.findById(id)
    if (!product) throw createError(404, 'Product is not found.')
    return successResponse(res, 200, 'Product was returned successfully!', {
      product,
    })
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      next(createError(400, 'Invalid ID'))
      return
    }
    next(error)
  }
}

const filterProducts: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { checkedPrice, checkedCategory } = req.body
    const filter: {
      price?: { $gte: number; $lte: number }
      category?: { $in: string[] }
    } = {}
    if (checkedPrice && checkedPrice.length === 2) {
      filter.price = { $gte: checkedPrice[0], $lte: checkedPrice[1] }
    }
    if (checkedCategory && checkedCategory.length > 0) {
      filter.category = { $in: checkedCategory }
    }

    const products = await Product.find(filter)

    return successResponse(res, 200, 'Products filtered successfully!', {
      products,
    })
  } catch (error) {
    next(error)
  }
}

const searchProducts: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 3 } = req.query
    const searchValue =
      typeof req.query.searchValue === 'string'
        ? req.query.searchValue.trim()
        : ''
    let filter = {}
    const searchRegExpr = new RegExp('.*' + searchValue + '.*', 'i')
    if (searchValue) {
      filter = {
        $or: [
          { name: { $regex: searchRegExpr } },
          { description: { $regex: searchRegExpr } },
        ],
      }
    }
    const products = await Product.find(filter)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    return successResponse(
      res,
      200,
      'Searched products returned successfully!',
      {
        products,
      }
    )
  } catch (error) {
    next(error)
  }
}
export {
  createProduct,
  getAllProducts,
  deleteProduct,
  updateProduct,
  getSingleProduct,
  filterProducts,
  searchProducts,
}
