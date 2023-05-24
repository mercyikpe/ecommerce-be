import { Document, Schema, model } from 'mongoose'

export interface CategoryDocument extends Document {
  name: string
  slug: string
}

const categorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
)

const Category = model<CategoryDocument>('Category', categorySchema)

export default Category
