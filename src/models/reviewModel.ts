import { Document, Schema, model } from 'mongoose'

export interface ReviewDocument extends Document {
  name: string
  rating: number
  comment: string
  user: Schema.Types.ObjectId
}

const reviewSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

const Review = model<ReviewDocument>('Review', reviewSchema)

export default Review
