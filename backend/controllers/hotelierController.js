import expressAsyncHandler from "express-async-handler";
import hotelService from "../services/hotelService.js";
import generateHotelierToken from "../utils/generateHotelierToken.js";




const authHotelierHandler = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await hotelService.authHotelier(email, password);
    generateHotelierToken(res, user._id);
    res.status(200).json({
      status: 'success',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      message: 'Hotelier authenticated successfully',
    });
  } catch (error) {
    res.status(401).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});


const registerHotelierHandler = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const { user, userExists, message } = await hotelService.registerHotelier(name, email, password);
    if (userExists) {
      res.status(200).json({
        status: 'success',
        data: null,
        message: message,
        otpSent: true,
      });
    } else {
      res.status(201).json({
        status: 'success',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        message: message,
        otpSent: true,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});

const verifyHotelierOtpHandler = expressAsyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  try {
    const message = await hotelService.verifyHotelierOtp(email, otp);
    res.status(200).json({
      status: 'success',
      data: null,
      message: message,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});


const resendHotelierOtpHandler = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    await hotelService.resendOtp(email);
    res.status(200).json({
      status: 'success',
      data: null,
      message: 'OTP resent successfully',
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});

const logoutHotelierHandler = expressAsyncHandler(async (req, res) => {
  try {
    const response = await hotelService.logoutHotelier(res);
    res.status(200).json({
      status: 'success',
      data: response,
      message: 'Hotelier logged out successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server Error',
    });
  }
});


const getHotelierProfileHandler = expressAsyncHandler(async (req, res) => {
  try {
    const user = await hotelService.getHotelierProfile(req.hotelier._id);
    res.status(200).json({
      status: 'success',
      data: user,
      message: 'Hotelier profile retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server Error',
    });
  }
});

const updateHotelierProfileHandler = expressAsyncHandler(async (req, res) => {
  try {
    const updatedHotelier = await hotelService.updateHotelierProfile(
      req.hotelier._id,
      req.body,
      req.file
    );
    res.status(200).json({
      status: 'success',
      data: {
        _id: updatedHotelier._id,
        name: updatedHotelier.name,
        email: updatedHotelier.email,
        profileImageName: updatedHotelier.profileImageName
      },
      message: 'Hotelier profile updated successfully',
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});


const uploadVerificationDetailsHandler = expressAsyncHandler(async (req, res) => {
  const hotelId = req.params.hotelId;
  const certificatePath = req.file.path.replace(/.*public[\\/]/, "");

  try {
    await hotelService.uploadCertificates(hotelId, certificatePath);
    res.status(200).json({
      status: 'success',
      data: null,
      message: 'Verification details submitted successfully',
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});


const addHotelHandler = expressAsyncHandler(async (req, res) => {
  const { name, city, address, description, amenities, latitude, longitude } = req.body;

  const images = req.files.map((file) => {
    return file.path.replace(/.*public[\\/]/, ""); 
  });

  try {
    const response = await hotelService.addHotel(req.hotelier._id, {
      name,
      city,
      address,
      images,
      description,
      amenities: amenities.split(",").map((amenity) => amenity.trim()),
      latitude,
      longitude,
      isListed: true,
    });
    res.status(response.status).json({
      status: 'success',
      data: response.data,
      message: 'Hotel added successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server Error',
    });
  }
});



const getHotelsHandler = expressAsyncHandler(async (req, res) => {
  try {
    const hotelierId = req.hotelier._id;
    const hotelsWithUnreadMessages = await hotelService.getHotelsWithUnreadMessages(hotelierId);

    res.status(200).json({
      status: 'success',
      data: hotelsWithUnreadMessages,
      message: 'Hotels retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server Error',
    });
  }
});




const getHotelByIdHandler = expressAsyncHandler(async (req, res) => {
  try {
    const hotelId = req.params.id;
    const hotelDetails = await hotelService.getHotelDetailsById(hotelId);

    res.status(200).json({
      status: 'success',
      data: hotelDetails,
      message: 'Hotel details retrieved successfully',
    });
  } catch (error) {
    console.error("Error in handler:", error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error',
    });
  }
});


const updateHotelHandler = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedHotel = await hotelService.updateHotelData(id, updateData, req.files);
    res.status(200).json({
      status: 'success',
      data: updatedHotel,
      message: 'Hotel updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Error updating hotel',
    });
  }
};

const getHotelierStats = expressAsyncHandler(async (req, res) => {
  try {
    const hotelierId = req.hotelier._id;
    const stats = await hotelService.getHotelierStats(hotelierId);

    res.status(200).json({
      status: 'success',
      data: stats,
      message: 'Hotelier stats retrieved successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error',
    });
  }
});

const getHotelierSalesReport = expressAsyncHandler(async (req, res) => {
  const { from, to } = req.body;
  const hotelierId = req.hotelier._id;

  if (!from || !to) {
    return res.status(400).json({
      status: 'error',
      data: null,
      message: 'Date range is required',
    });
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return res.status(400).json({
      status: 'error',
      data: null,
      message: 'Invalid date format',
    });
  }

  try {
    const salesReport = await hotelService.getHotelierSalesReport(hotelierId, fromDate, toDate);

    res.status(200).json({
      status: 'success',
      data: salesReport,
      message: 'Sales report retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Internal server error',
    });
  }
});










export {
  authHotelierHandler,
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
  getHotelierStats,
  getHotelierSalesReport,
};
