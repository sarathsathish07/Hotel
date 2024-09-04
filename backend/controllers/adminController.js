import expressAsyncHandler from 'express-async-handler';
import adminService from '../services/adminService.js';

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
      message: 'Admin authenticated successfully',
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
      message,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error during admin logout',
    });
  }
});


const getAllUsers = expressAsyncHandler(async (req, res) => {
  try {
    const users = await adminService.getAllUsers();
    res.status(200).json({
      status: 'success',
      data: users,
      message: 'Users retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error retrieving users',
    });
  }
});



const getVerificationDetails = expressAsyncHandler(async (req, res) => {
  try {
    const hotels = await adminService.getVerificationDetails();
    res.status(200).json({
      status: 'success',
      data: hotels,
      message: 'Verification details retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error retrieving verification details',
    });
  }
});


const acceptVerification = expressAsyncHandler(async (req, res) => {
  try {
    await adminService.acceptVerification(req.params.hotelId);
    res.status(200).json({
      status: 'success',
      data: null,
      message: 'Verification accepted',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error accepting verification',
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
      message: 'Verification rejected',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error rejecting verification',
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
      message,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error while blocking user',
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
      message,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error while unblocking user',
    });
  }
});


const getAllHotels = expressAsyncHandler(async (req, res) => {
  try {
    const hotels = await adminService.getAllHotels();
    res.status(200).json({
      status: 'success',
      data: hotels,
      message: 'Hotels retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error while retrieving hotels',
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
      message: 'Hotel listed successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error while listing hotel',
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
      message: 'Hotel unlisted successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error while unlisting hotel',
    });
  }
});


const getAdminStats = expressAsyncHandler(async (req, res) => {
  try {
    const stats = await adminService.getAdminStats();

    res.status(200).json({
      status: 'success',
      data: stats,
      message: 'Admin statistics retrieved successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error while retrieving admin statistics',
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
      message: 'Sales report generated successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      status: 'error',
      data: null,
      message: error.message,
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
