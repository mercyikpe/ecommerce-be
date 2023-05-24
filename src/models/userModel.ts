import mongoose, { Document, Schema, model } from 'mongoose'
import validator from 'validator'

export interface UserDocument extends Document {
  name: string
  email: string
  password: string
  isAdmin: boolean
  isBanned: boolean
}

const userSchema: Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: [2, 'name should be min 2 characters'],
      required: [true, 'name is mandatory'],
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: [6, 'password should be min 6 characters'],
      required: [true, 'password is mandatory'],
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    isBanned: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

const User = model<UserDocument>('User', userSchema)

export default User
