import expressAsyncHandler from "express-async-handler";
import userService from "../services/userService.js";
import User from "../models/userModel.js";
import Hotel from "../models/hotelModel.js";
import Room from "../models/roomModel.js";
import responseMessages from "../constants/responseMessages.js";

const authUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userService.authenticateUser(email, password);
    userService.generateToken(res, user._id);
    res.status(200).json({
      status: "success",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      message: responseMessages.AUTH_USER_SUCCESS,
    });
  } catch (error) {
    res.status(401).json({
      status: "error",
      data: null,
      message: responseMessages.AUTH_USER_ERROR,
    });
  }
});

const googleLogin = async (req, res) => {
  const { googleName: name, googleEmail: email } = req.body;
  try {
    let user = await User.findOne({ email });

    if (user) {
      if (!user.isBlocked) {
        userService.generateToken(res, user._id);
        res.status(200).json({
          status: "success",
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
          message: responseMessages.GOOGLE_LOGIN_SUCCESS,
        });
      } else {
        res.status(401).json({
          status: "error",
          data: null,
          message: responseMessages.GOOGLE_LOGIN_ERROR,
        });
      }
    } else {
      user = await User.create({ name, email });
      userService.generateToken(res, user._id);
      res.status(201).json({
        status: "success",
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        message: responseMessages.GOOGLE_LOGIN_NEW_USER,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: "error",
      data: null,
      message: responseMessages.GOOGLE_LOGIN_ERROR,
    });
  }
};

const registerUser = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const { user, userExists, message } = await userService.registerNewUser(
      name,
      email,
      password
    );
    const statusCode = userExists ? 200 : 201;
    const responseData = userExists
      ? { otpSent: true }
      : { _id: user._id, name: user.name, email: user.email, otpSent: true };

    res.status(statusCode).json({
      status: "success",
      data: responseData,
      message: responseMessages.REGISTER_USER_SUCCESS,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      data: null,
      message: responseMessages.REGISTER_USER_ERROR,
    });
  }
});

const verifyOtp = expressAsyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  try {
    const message = await userService.verifyUserOtp(email, otp);
    res.status(200).json({
      status: "success",
      data: null,
      message: responseMessages.VERIFY_OTP_SUCCESS,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      data: null,
      message: responseMessages.VERIFY_OTP_ERROR,
    });
  }
});

const resendOtp = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    await userService.resendOtp(email);
    res.status(200).json({
      status: "success",
      data: null,
      message: responseMessages.RESEND_OTP_SUCCESS,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      data: null,
      message: responseMessages.RESEND_OTP_ERROR,
    });
  }
});

const logoutUser = expressAsyncHandler((req, res) => {
  try {
    const message = userService.logoutUser(res);
    res.status(200).json({
      status: "success",
      data: null,
      message: responseMessages.LOGOUT_USER_SUCCESS,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      data: null,
      message: responseMessages.LOGOUT_USER_ERROR,
    });
  }
});

const getUserProfile = expressAsyncHandler(async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user._id);
    res.status(200).json({
      status: "success",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImageName: user.profileImageName,
      },
      message: responseMessages.USER_PROFILE_SUCCESS,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      data: null,
      message: responseMessages.USER_PROFILE_ERROR,
    });
  }
});

const updateUserProfile = expressAsyncHandler(async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.profileImage = req.file;
    }

    const updatedUser = await userService.updateUserProfileService(
      req.user._id,
      updateData
    );

    res.status(200).json({
      status: "success",
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImageName: updatedUser.profileImageName,
      },
      message: responseMessages.USER_PROFILE_UPDATE_SUCCESS,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      data: null,
      message: responseMessages.USER_PROFILE_UPDATE_ERROR,
    });
  }
});

const getHotels = async (req, res) => {
  try {
    const {
      sort = "",
      amenities = "",
      city = "",
      latitude,
      longitude,
    } = req.query;
    const amenitiesArray = amenities ? amenities.split(",") : [];
    const radiusInKm = 50;

    let hotels = [];

    if (latitude && longitude) {
      const userLatitude = parseFloat(latitude);
      const userLongitude = parseFloat(longitude);

      hotels = await Hotel.find({ isListed: true });

      const filteredHotels = hotels.filter((hotel) => {
        const hotelLatitude = hotel.latitude;
        const hotelLongitude = hotel.longitude;

        if (hotelLatitude !== undefined && hotelLongitude !== undefined) {
          const distance = haversineDistance(
            userLatitude,
            userLongitude,
            hotelLatitude,
            hotelLongitude
          );
          return distance <= radiusInKm;
        }
        return false;
      });

      hotels = filteredHotels;
    } else if (city) {
      hotels = await Hotel.find({ city, isListed: true });
    } else {
      hotels = await Hotel.find({ isListed: true });
    }

    if (amenitiesArray.length > 0) {
      hotels = hotels.filter((hotel) =>
        amenitiesArray.every((amenity) => hotel.amenities.includes(amenity))
      );
    }

    const hotelsWithAvgPrice = await Promise.all(
      hotels.map(async (hotel) => {
        const rooms = await Room.find({ hotelId: hotel._id });
        const avgPrice =
          rooms.reduce((total, room) => total + room.price, 0) / rooms.length;
        return { ...hotel.toObject(), avgPrice: avgPrice.toFixed(2) };
      })
    );

    if (sort === "asc") {
      hotelsWithAvgPrice.sort((a, b) => a.avgPrice - b.avgPrice);
    } else if (sort === "desc") {
      hotelsWithAvgPrice.sort((a, b) => b.avgPrice - a.avgPrice);
    }

    res.status(200).json({
      status: "success",
      data: hotelsWithAvgPrice,
      message: responseMessages.HOTELS_RETRIEVED_SUCCESS,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      data: null,
      message: responseMessages.HOTELS_RETRIEVAL_ERROR,
    });
  }
};

const getHotelDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({
        status: "error",
        data: null,
        message: responseMessages.HOTEL_NOT_FOUND,
      });
    }

    const rooms = await Room.find({ hotelId: id });

    res.status(200).json({
      status: "success",
      data: {
        hotel,
        rooms,
      },
      message: responseMessages.HOTEL_RETRIEVED_SUCCESS,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      data: null,
      message: responseMessages.HOTEL_RETRIEVAL_ERROR,
    });
  }
};

const sendPasswordResetEmail = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "error",
        data: null,
        message: responseMessages.PASSWORD_RESET_EMAIL_ERROR,
      });
    }

    await userService.sendPasswordResetEmailService(email);
    res.status(200).json({
      status: "success",
      data: null,
      message: responseMessages.PASSWORD_RESET_EMAIL_SUCCESS,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      data: null,
      message: responseMessages.PASSWORD_RESET_EMAIL_ERROR,
    });
  }
});

const resetPassword = expressAsyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    await userService.resetPasswordService(email, newPassword);
    res.status(200).json({
      status: "success",
      data: null,
      message: responseMessages.PASSWORD_RESET_SUCCESS,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      data: null,
      message: responseMessages.PASSWORD_RESET_ERROR,
    });
  }
});

export {
  authUser,
  googleLogin,
  registerUser,
  verifyOtp,
  resendOtp,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getHotels,
  getHotelDetails,
  sendPasswordResetEmail,
  resetPassword,
};
