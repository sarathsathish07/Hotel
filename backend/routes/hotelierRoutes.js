import express from 'express';
import { multerUploadCertificate, multerUploadUserProfile, multerUploadHotelImages, multerUploadRoomImages,multerUploadMessageFile } from "../config/multerConfig.js";
import { authHotelierHandler,
  registerHotelierHandler,
  verifyHotelierOtpHandler,
  logoutHotelierHandler,
  getHotelierProfileHandler,
  updateHotelierProfileHandler,
  uploadVerificationDetailsHandler,
  addHotelHandler,
  getHotelsHandler,
  getHotelByIdHandler,
  updateHotelHandler,
  resendHotelierOtpHandler,
  getStatsHandler,
  getSalesReportHandler,
 } from '../controllers/hotelierController.js';
 import { addRoom,getRoomById,updateRoomHandler } from '../controllers/roomController.js';
 import { getUnreadHotelierNotifications,markHotelierNotificationAsRead } from '../controllers/notificationController.js';
 import { cancelBookingByHotelier } from '../controllers/bookingController.js';
 import { getHotelierBookings } from '../controllers/bookingController.js';
import { protect } from '../middleware/hotelierAuthMiddleware.js';
import { getHotelMessages,sendHotelMessages,getHotelChatRooms,markHotelMessagesAsRead ,getHotelUnreadMessages} from '../controllers/chatController.js';


const router = express.Router();

router.post('/', registerHotelierHandler);
router.post('/auth', authHotelierHandler); 
router.post('/verify-otp', verifyHotelierOtpHandler);
router.post('/resend-otp', resendHotelierOtpHandler);
router.post('/logout', logoutHotelierHandler); 
router.route('/profile').get(protect, getHotelierProfileHandler).put( multerUploadUserProfile.single('profileImage'),protect, updateHotelierProfileHandler); 
router.post('/upload-certificate/:hotelId', protect, multerUploadCertificate.single('certificate'), uploadVerificationDetailsHandler); 
router.post("/add-hotel",protect, multerUploadHotelImages.array("images", 5),addHotelHandler); 
router.get('/unreadHotelmessages', protect, getHotelUnreadMessages); 
router.get('/get-hotels',protect, getHotelsHandler); 
router.get('/bookings',protect, getHotelierBookings); 
router.get('/dashboard',protect,getStatsHandler), 
router.route('/hotels/:id').get(protect,getHotelByIdHandler).put(protect,multerUploadHotelImages.array("images", 5), updateHotelHandler); 
router.post('/add-room/:hotelId', protect, multerUploadRoomImages.array("images", 5), addRoom); 
router.put('/rooms/:roomId', protect, multerUploadRoomImages.array("images", 5), updateRoomHandler); 
router.get('/rooms/:roomId',protect, getRoomById); 
router.post('/salesReport',protect, getSalesReportHandler ); 
router.put('/cancel-booking/:bookingId', protect, cancelBookingByHotelier); 

router.get('/chatrooms/:hotelId',protect, getHotelChatRooms); 
router.route('/chatrooms/:chatRoomId/messages').get(protect, getHotelMessages).post(multerUploadMessageFile.single('file'),protect, sendHotelMessages); 
router.route('/mark-messages-read').post(protect, markHotelMessagesAsRead); 
router.get('/notifications/unread',protect, getUnreadHotelierNotifications); 
router.put('/notifications/:id/read',protect, markHotelierNotificationAsRead); 



export default router;
