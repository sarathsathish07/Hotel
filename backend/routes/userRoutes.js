import express from 'express';
import { authUser, 
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  verifyOtp,
  getHotels,
  resendOtp,
  getHotelById,
  sendPasswordResetEmail,
  resetPassword,
  googleLogin,
} from '../controllers/userController.js';
import { saveBooking,updateBookingStatus,getBookingsByUserId,checkRoomAvailability,cancelBooking } from '../controllers/bookingController.js';
import { getChatRooms,createChatRoom,getMessages,sendMessage,getUnreadMessages,markMessagesAsRead } from '../controllers/chatController.js';
import { getReviews,getBookingReviews,addReview } from '../controllers/reviewController.js';
import { getUnreadNotifications,markNotificationAsRead } from '../controllers/notificationController.js';
import { getRoomsByHotelIds,getRoomByRoomId } from '../controllers/roomController.js';
import { getWalletBalance,getWalletTransactions,addCashToWallet } from '../controllers/walletController.js';
import { protect } from '../middleware/authMiddleware.js';
import { multerUploadUserProfile,multerUploadMessageFile } from "../config/multerConfig.js";

const router = express.Router()


router.post('/',registerUser)
router.post('/auth',authUser) 
router.post('/googleLogin',googleLogin)
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', sendPasswordResetEmail);
router.put('/reset-password/:token', resetPassword);
router.post('/logout',logoutUser) 
router.route('/profile').get(protect,getUserProfile).put( multerUploadUserProfile.single('profileImage'),protect,updateUserProfile); 
router.get('/hotels',getHotels ) 
router.post('/rooms', getRoomsByHotelIds); 
router.get('/rooms/:roomId',protect, getRoomByRoomId); 
router.get('/hotels/:id', getHotelById); 
router.get('/reviews/:hotelId',getReviews ); 
router.get('/reviews',protect,getBookingReviews ); 
router.post('/booking',protect, saveBooking); 
router.post('/check-availability',protect, checkRoomAvailability); 
router.put('/booking/update-status',protect, updateBookingStatus); 
router.get('/bookings', protect, getBookingsByUserId); 
router.get('/wallet', protect, getWalletTransactions); 
router.post('/wallet/add-cash', protect, addCashToWallet); 
router.get('/wallet/balance', protect, getWalletBalance); 
router.put('/wallet/update', protect, getWalletBalance); 
router.post('/add-review', protect, addReview); 
router.put('/cancel-booking/:bookingId', protect, cancelBooking); 
router.get('/notifications/unread',protect, getUnreadNotifications); 
router.put('/notifications/:id/read',protect, markNotificationAsRead); 
router.route('/chatrooms').get(protect, getChatRooms).post(protect, createChatRoom); 
router.route('/chatrooms/:chatRoomId/messages').get(protect, getMessages).post(multerUploadMessageFile.single('file'),protect, sendMessage); 
router.get('/unread-messages', protect, getUnreadMessages); 
router.route('/mark-messages-read').post(protect, markMessagesAsRead); 




export default router
