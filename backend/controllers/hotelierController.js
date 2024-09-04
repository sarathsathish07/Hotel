import expressAsyncHandler from "express-async-handler";
import hotelService from "../services/hotelService.js";
import generateHotelierToken from "../utils/generateHotelierToken.js";
import responseMessages from "../constants/responseMessages.js";

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
      message: responseMessages.success.hotelierAuthenticated,
    });
  } catch (error) {
    res.status(401).json({
      status: 'error',
      data: null,
      message: responseMessages.error.invalidCredentials,
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
        message: responseMessages.success.hotelierRegistered,
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
        message: responseMessages.success.hotelierRegistered,
        otpSent: true,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 'error',
      data: null,
      message: responseMessages.error.otpFailed,
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
      message: responseMessages.success.otpVerified,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      data: null,
      message: responseMessages.error.otpFailed,
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
      message: responseMessages.success.otpResent,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      data: null,
      message: responseMessages.error.resendOtpFailed,
    });
  }
});

const logoutHotelierHandler = expressAsyncHandler(async (req, res) => {
  try {
    const response = await hotelService.logoutHotelier(res);
    res.status(200).json({
      status: 'success',
      data: response,
      message: responseMessages.success.hotelierLoggedOut,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.error.serverError,
    });
  }
});

const getHotelierProfileHandler = expressAsyncHandler(async (req, res) => {
  try {
    const user = await hotelService.getHotelierProfile(req.hotelier._id);
    res.status(200).json({
      status: 'success',
      data: user,
      message: responseMessages.success.profileRetrieved,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.error.serverError,
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
      message: responseMessages.success.profileUpdated,
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      data: null,
      message: responseMessages.error.serverError,
    });
  }
});

const uploadVerificationDetailsHandler = expressAsyncHandler(async (req, res) => {
  const hotelId = req.params.hotelId;
  const certificatePath = req.file.path.replace(/.*public[\\/]/, "");

  try {
    await hotelService.uploadCertificate(hotelId, certificatePath);
    res.status(200).json({
      status: 'success',
      data: null,
      message: responseMessages.success.verificationDetailsSubmitted,
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      data: null,
      message: responseMessages.error.uploadFailed,
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
      message: responseMessages.success.hotelAdded,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.error.serverError,
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
      message: responseMessages.success.hotelsRetrieved,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.error.serverError,
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
      message: responseMessages.success.hotelDetailsRetrieved,
    });
  } catch (error) {
    console.error("Error in handler:", error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.error.serverError,
    });
  }
});

const updateHotelHandler = async (req, res) => {
  const hotelId = req.params.id;
  const { name, city, address, description, amenities, latitude, longitude } = req.body;

  const images = req.files.map((file) => {
    return file.path.replace(/.*public[\\/]/, "");
  });

  try {
    const updatedHotel = await hotelService.updateHotelData(
      hotelId,
      req.hotelier._id,
      {
        name,
        city,
        address,
        images,
        description,
        amenities: amenities.split(",").map((amenity) => amenity.trim()),
        latitude,
        longitude,
      }
    );
    res.status(200).json({
      status: 'success',
      data: updatedHotel,
      message: responseMessages.success.hotelUpdated,
    });
  } catch (error) {
    console.error("Error in handler:", error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.error.serverError,
    });
  }
};

const getStatsHandler = expressAsyncHandler(async (req, res) => {
  try {
    const hotelierId = req.hotelier._id;
    const stats = await hotelService.getHotelierStats(hotelierId);

    res.status(200).json({
      status: 'success',
      data: stats,
      message: responseMessages.success.statsRetrieved,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.error.serverError,
    });
  }
});

const getSalesReportHandler = expressAsyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        status: 'error',
        data: null,
        message: responseMessages.error.invalidDateRange,
      });
    }

    const salesReport = await hotelService.getHotelierSalesReport (startDate, endDate);

    res.status(200).json({
      status: 'success',
      data: salesReport,
      message: responseMessages.success.salesReportRetrieved,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.error.serverError,
    });
  }
});

export {
  authHotelierHandler,
  registerHotelierHandler,
  verifyHotelierOtpHandler,
  resendHotelierOtpHandler,
  logoutHotelierHandler,
  getHotelierProfileHandler,
  updateHotelierProfileHandler,
  uploadVerificationDetailsHandler,
  addHotelHandler,
  getHotelsHandler,
  getHotelByIdHandler,
  updateHotelHandler,
  getStatsHandler,
  getSalesReportHandler,
};
