import express from 'express'
const router= express.Router()
import { authAdmin, 
  logoutAdmin,
  getAllUsers,
  getVerificationDetails,
  acceptVerification,
  rejectVerification,
  blockUser,
  unblockUser,
  getAllHotels,
  listHotel,
  unlistHotel,
  getAdminStats,
  getSalesReport,
   } from '../controllers/adminController.js'
  import { getAllBookings } from '../controllers/bookingController.js'
import {protect} from '../middleware/adminAuthMiddleware.js'

  router.post('/auth',authAdmin)
  router.post('/logout',logoutAdmin) 
  router.post('/get-user',protect,getAllUsers) 
  router.get('/verification',protect,getVerificationDetails) 
  router.put('/verification/:hotelId/accept',protect,acceptVerification) 
  router.put('/verification/:adminId/reject', protect,rejectVerification); 
  router.patch('/block-user',protect,blockUser) 
  router.patch('/unblock-user',protect,unblockUser) 
  router.get('/get-hotels', protect, getAllHotels); 
  router.patch('/list-hotel/:hotelId', protect, listHotel); 
  router.patch('/unlist-hotel/:hotelId', protect, unlistHotel); 
  router.get('/bookings', protect, getAllBookings); 
  router.get('/stats',protect, getAdminStats); 
  router.post('/sales-report',protect,getSalesReport) 

  
  
  





export default router