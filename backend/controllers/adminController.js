import expressAsyncHandler from 'express-async-handler';
import adminService from '../services/adminService.js';
import responseMessages from '../constants/responseMessages.js';

const authAdmin = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await adminService.authenticateAdmin(email, password);
    adminService.generateAdminToken(res, admin._id);
    res.status(201).json({
      status: 'success',
      data: {
        _id: admin._id,
        email: admin.email,
      },
      message: responseMessages.ADMIN_AUTHENTICATED_SUCCESSFULLY,
    });
  } catch (error) {
    res.status(401).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});

const logoutAdmin = expressAsyncHandler(async (req, res) => {
  try {
    const message = adminService.logoutAdmin(res);
    res.status(200).json({
      status: 'success',
      data: null,
      message: responseMessages.SERVER_ERROR_ADMIN_LOGOUT,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.SERVER_ERROR_ADMIN_LOGOUT,
    });
  }
});

const getAllUsers = expressAsyncHandler(async (req, res) => {
  try {
    const users = await adminService.getAllUsers();
    res.status(200).json({
      status: 'success',
      data: users,
      message: responseMessages.USERS_RETRIEVED_SUCCESSFULLY,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.SERVER_ERROR_RETRIEVING_USERS,
    });
  }
});

const getVerificationDetails = expressAsyncHandler(async (req, res) => {
  try {
    const hotels = await adminService.getVerificationDetails();
    res.status(200).json({
      status: 'success',
      data: hotels,
      message: responseMessages.VERIFICATION_DETAILS_RETRIEVED,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.SERVER_ERROR_RETRIEVING_VERIFICATION_DETAILS,
    });
  }
});

const acceptVerification = expressAsyncHandler(async (req, res) => {
  try {
    await adminService.acceptVerification(req.params.hotelId);
    res.status(200).json({
      status: 'success',
      data: null,
      message: responseMessages.VERIFICATION_ACCEPTED,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.SERVER_ERROR_ACCEPTING_VERIFICATION,
    });
  }
});

const rejectVerification = expressAsyncHandler(async (req, res) => {
  try {
    const { hotelId } = req.params; 
    const { reason } = req.body;  

    await adminService.rejectVerification(hotelId, reason); 
    res.status(200).json({
      status: 'success',
      data: null,
      message: responseMessages.VERIFICATION_REJECTED,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.SERVER_ERROR_REJECTING_VERIFICATION,
    });
  }
});

const blockUser = expressAsyncHandler(async (req, res) => {
  try {
    const { userId } = req.body;
    const message = await adminService.blockUser(userId);
    res.status(200).json({
      status: 'success',
      data: null,
      message: responseMessages.USER_BLOCKED,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.SERVER_ERROR_BLOCKING_USER,
    });
  }
});

const unblockUser = expressAsyncHandler(async (req, res) => {
  try {
    const { userId } = req.body;
    const message = await adminService.unblockUser(userId);
    res.status(200).json({
      status: 'success',
      data: null,
      message: responseMessages.USER_UNBLOCKED,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.SERVER_ERROR_UNBLOCKING_USER,
    });
  }
});

const getAllHotels = expressAsyncHandler(async (req, res) => {
  try {
    const hotels = await adminService.getAllHotels();
    res.status(200).json({
      status: 'success',
      data: hotels,
      message: responseMessages.HOTELS_RETRIEVED_SUCCESSFULLY,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.SERVER_ERROR_RETRIEVING_HOTELS,
    });
  }
});

const listHotel = expressAsyncHandler(async (req, res) => {
  try {
    const { hotelId } = req.params;
    const result = await adminService.listHotel(hotelId);
    res.status(200).json({
      status: 'success',
      data: result,
      message: responseMessages.HOTEL_LISTED_SUCCESSFULLY,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.SERVER_ERROR_LISTING_HOTEL,
    });
  }
});

const unlistHotel = expressAsyncHandler(async (req, res) => {
  try {
    const { hotelId } = req.params;
    const result = await adminService.unlistHotel(hotelId);
    res.status(200).json({
      status: 'success',
      data: result,
      message: responseMessages.HOTEL_UNLISTED_SUCCESSFULLY,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.SERVER_ERROR_UNLISTING_HOTEL,
    });
  }
});

const getAdminStats = expressAsyncHandler(async (req, res) => {
  try {
    const stats = await adminService.getAdminStats();
    res.status(200).json({
      status: 'success',
      data: stats,
      message: responseMessages.ADMIN_STATS_RETRIEVED,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.SERVER_ERROR_RETRIEVING_ADMIN_STATS,
    });
  }
});

const getSalesReport = expressAsyncHandler(async (req, res) => {
  const { from, to } = req.body;

  try {
    const bookings = await adminService.getSalesReport(from, to);
    res.status(200).json({
      status: 'success',
      data: bookings,
      message: responseMessages.SALES_REPORT_GENERATED_SUCCESSFULLY,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      status: 'error',
      data: null,
      message: responseMessages.SERVER_ERROR_GENERATING_SALES_REPORT,
    });
  }
});

export {
  authAdmin,
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
};
