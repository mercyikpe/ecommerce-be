import { body } from 'express-validator'

const validateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Product name should be between 3 to 200 characters long'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product Description is required')
    .isLength({ min: 3 })
    .withMessage('Product Description should be minimum 3 characters long.'),
  body('price').trim().notEmpty().withMessage('Price is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('countInStock')
    .trim()
    .notEmpty()
    .withMessage('countInStock is required'),
]

export default validateProduct
