import express from 'express'
import upload from '../middlewares/fileUpload'
const router = express.Router()
import { isAuth, isAdmin } from '../middlewares/auth'
import {
  getAllProducts,
  getSingleProduct,
  createProduct,
  deleteProduct,
  updateProduct,
  filterProducts,
  searchProducts,
} from '../controllers/productController'
import validateProduct from '../middlewares/productValidator'
import runValidation from '../middlewares'

router.post(
  '/',
  upload.single('image'),
  validateProduct,
  runValidation,
  isAuth,
  isAdmin,
  createProduct
)
router.put(
  '/updateproduct/:id',
  upload.single('image'),
  isAuth,
  isAdmin,
  updateProduct
)
router.get('/getallproducts', getAllProducts)
router.get('/search', searchProducts)
router.delete('/deleteproduct/:id', isAuth, isAdmin, deleteProduct)
router.get('/getsingleproduct/:id', getSingleProduct)
router.post('/filteredproducts/', filterProducts)
export default router
