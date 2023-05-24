import { Request, Response, NextFunction, RequestHandler } from 'express'
import createError from 'http-errors'
import Category from '../models/categoryModel'
import { successResponse } from '../util/responseHandler'
import slugify from 'slugify'

const createCategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body
    const category = await Category.findOne({ name })
    if (category)
      throw createError(400, `Category already exists with name ${name}.`)
    const newCategory = await Category.create({
      ...req.body,
      slug: slugify(name),
    })
    if (!newCategory) throw createError(400, 'Product was not added!')
    successResponse(res, 201, 'Category was added successfully!', newCategory)
  } catch (error) {
    next(error)
  }
}

const getCategories: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await Category.find({}).select('name slug')
    successResponse(res, 200, 'All categories returned', categories)
  } catch (error) {
    next(error)
  }
}

const getCategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params
    const category = await Category.findOne({ slug }).select('name slug')
    if (!category) throw createError(404, 'Category is not found.')
    successResponse(res, 200, 'Category was returned', { category })
  } catch (error) {
    next(error)
  }
}

const deleteCategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params
    const category = await Category.findOneAndDelete({ slug })
    if (!category) throw createError(404, 'Category is not found.')
    successResponse(res, 200, 'Category was deleted')
  } catch (error) {
    next(error)
  }
}

const updateCategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params
    const category = await Category.findOne({ slug })
    if (!category) throw createError(404, `No category found with slug ${slug}`)
    const updateCategory = await Category.findOneAndUpdate(
      { slug },
      {
        $set: {
          ...req.body,
          slug: slugify(req.body.name),
        },
      },
      { new: true }
    )
    if (!updateCategory) throw createError(400, 'Category is not updated')
    return successResponse(res, 200, 'Category is updated', {
      updateCategory,
    })
  } catch (error) {
    next(error)
  }
}
export {
  createCategory,
  getCategories,
  getCategory,
  deleteCategory,
  updateCategory,
}
