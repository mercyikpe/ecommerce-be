import express from 'express'
import {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  deleteUser,
  getAllUsers,
  userProfile,
  updateUser,
  forgetPassword,
  resetPassword,
  getRefreshToken,
  banID,
  unbanID,
} from '../controllers/userController'
import { isAuth, isAdmin } from '../middlewares/auth'

const router = express.Router()

router.post('/', registerUser)
router.post('/activate', verifyEmail)
router.post('/loginuser', loginUser)
router.post('/logout', isAuth, logoutUser)
router.delete('/:id', isAuth, isAdmin, deleteUser)
router.get('/getallusers', isAuth, isAdmin, getAllUsers)
router.get('/getuserprofile/:id', isAuth, userProfile)
router.put('/updateuser/:email', isAuth, updateUser)
router.post('/forgetpassword', forgetPassword)
router.post('/resetpassword', resetPassword)
router.get('/refreshtoken', isAuth, getRefreshToken)
router.get('/banuser/:id', isAuth, isAdmin, banID)
router.get('/unbanuser/:id', isAuth, isAdmin, unbanID)

export default router
