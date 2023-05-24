import { Request } from 'express'
import multer, { FileFilterCallback } from 'multer'

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void
const FILE_SIZE = 1024 * 1024 * 2
const storage = multer.diskStorage({
  destination: function (
    req: Request,
    file: Express.Multer.File,
    cb: DestinationCallback
  ) {
    // cb(null, 'public/images/products')
    cb(null, 'images/products')
  },
  filename: function (
    req: Request,
    file: Express.Multer.File,
    cb: FileNameCallback
  ) {
    cb(null, Date.now() + '-' + file.originalname)
  },
})

const upload: multer.Multer = multer({
  storage: storage,
  limits: { fileSize: FILE_SIZE },
})
export default upload
