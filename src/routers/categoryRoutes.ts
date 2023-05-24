import express from 'express'
import upload from '../middlewares/fileUpload'
const router = express.Router()
import { isAuth, isAdmin } from '../middlewares/auth'
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from '../controllers/categoryController'
import runValidation from '../middlewares'
import validateCategory from '../middlewares/categoryValidator'

router.post(
  '/',
  validateCategory,
  runValidation,
  isAuth,
  isAdmin,
  createCategory
)
router.put(
  '/:slug',
  validateCategory,
  runValidation,
  isAuth,
  isAdmin,
  updateCategory
)
router.get('/', getCategories)
router.get('/:slug', isAuth, isAdmin, getCategory)
router.delete('/:slug', isAuth, isAdmin, deleteCategory)

export default router
