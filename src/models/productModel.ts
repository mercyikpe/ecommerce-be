import { Document, Schema, model } from 'mongoose'

export interface ProductDocument extends Document {
  name: string
  image: number
  brand: string
  description: string
  reviews: Schema.Types.ObjectId
  rating: number
  numReviews: number
  price: number
  countInStock: number
  sold: number
  category: Schema.Types.ObjectId
}

const productSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required!'],
      trim: true,
      minlength: [3, 'Product name must be minimum 3 characters!'],
    },
    image: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      minlength: [3, 'Product name must be minimum 3 characters!'],
      required: [true, 'Description is required!'],
    },
    reviews: {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
      validate: {
        validator: function (v: number) {
          return v > 0
        },
        message: 'Product price cannot be negative.',
      },
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Product = model<ProductDocument>('Product', productSchema)

export default Product
