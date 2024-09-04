import expressAsyncHandler from 'express-async-handler';
import * as userService from '../services/userService.js';
import walletService from '../services/walletService.js';
import reviewService from '../services/reviewService.js';
import bookingService from '../services/bookingService.js';
import notificationService from '../services/notificationService.js';
import { generateToken } from '../services/userService.js';
import User from '../models/userModel.js';
import Wallet from '../models/walletModel.js';
import RatingReview from '../models/ratingReviewModel.js';
import Booking from '../models/bookingModel.js';
import Hotel from '../models/hotelModel.js';
import Room from '../models/roomModel.js';
import Notification from '../models/notificationModel.js';
import HotelierNotification from '../models/hotelierNotifications.js';

const authUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userService.authenticateUser(email, password);
    generateToken(res, user._id);
    res.status(200).json({
      status: 'success',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      message: 'User authenticated successfully',
    });
  } catch (error) {
    res.status(401).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});

const googleLogin = async (req, res) => {
  const { googleName: name, googleEmail: email } = req.body;
  try {
    let user = await User.findOne({ email });

    if (user) {
      if (!user.isBlocked) {
        generateToken(res, user._id);
        res.status(200).json({
          status: 'success',
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
          message: 'User logged in successfully with Google',
        });
      } else {
        res.status(401).json({
          status: 'error',
          data: null,
          message: 'User is blocked or not authorized',
        });
      }
    } else {
      user = await User.create({ name, email });
      generateToken(res, user._id);
      res.status(201).json({
        status: 'success',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        message: 'New user created and logged in with Google',
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 'error',
      data: null,
      message: 'Failed to authenticate using Google',
    });
  }
};



const registerUser = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const { user, userExists, message } = await userService.registerNewUser(name, email, password);
    const statusCode = userExists ? 200 : 201;
    const responseData = userExists
      ? { otpSent: true }
      : { _id: user._id, name: user.name, email: user.email, otpSent: true };

    res.status(statusCode).json({
      status: 'success',
      data: responseData,
      message,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});


const verifyOtp = expressAsyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  try {
    const message = await userService.verifyUserOtp(email, otp);
    res.status(200).json({
      status: 'success',
      data: null,
      message,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});

const resendOtp = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    await userService.resendOtp(email);
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


const logoutUser = expressAsyncHandler((req, res) => {
  try {
    const message = userService.logoutUser(res);
    res.status(200).json({
      status: 'success',
      data: null,
      message,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});


const getUserProfile = expressAsyncHandler(async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user._id);
    res.status(200).json({
      status: 'success',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImageName: user.profileImageName,
      },
      message: 'User profile retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: error.message,
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
      status: 'success',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImageName: updatedUser.profileImageName,
      },
      message: 'User profile updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});



const getHotels = async (req, res) => {
  try {
    const { sort = '', amenities = '', city = '', latitude, longitude } = req.query;
    const amenitiesArray = amenities ? amenities.split(',') : [];
    const radiusInKm = 50;

    let hotels = [];

    if (latitude && longitude) {
      const userLatitude = parseFloat(latitude);
      const userLongitude = parseFloat(longitude);

      hotels = await Hotel.find({ isListed: true });

      const filteredHotels = hotels.filter(hotel => {
        const hotelLatitude = hotel.latitude;
        const hotelLongitude = hotel.longitude;
        
        if (hotelLatitude !== undefined && hotelLongitude !== undefined) {
          const distance = haversineDistance(userLatitude, userLongitude, hotelLatitude, hotelLongitude);
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
      hotels = hotels.filter(hotel => amenitiesArray.every(amenity => hotel.amenities.includes(amenity)));
    }

    const hotelsWithAvgPrice = await Promise.all(hotels.map(async hotel => {
      const rooms = await Room.find({ hotelId: hotel._id });
      const avgPrice = rooms.reduce((sum, room) => sum + room.price, 0) / rooms.length;
      return { ...hotel.toObject(), avgPrice }; 
    }));

    if (sort === 'price_low_high') {
      hotelsWithAvgPrice.sort((a, b) => a.avgPrice - b.avgPrice);
    } else if (sort === 'price_high_low') {
      hotelsWithAvgPrice.sort((a, b) => b.avgPrice - a.avgPrice);
    }

    res.status(200).json({
      status: 'success',
      data: hotelsWithAvgPrice,
      message: 'Hotels retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
};


const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};



const getHotelById = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await userService.getSingleHotelById(id);
    if (hotel) {
      res.status(200).json({
        status: 'success',
        data: hotel,
        message: 'Hotel retrieved successfully',
      });
    } else {
      res.status(404).json({
        status: 'error',
        data: null,
        message: 'Hotel not found',
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});


const sendPasswordResetEmail = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    const response = await userService.sendPasswordResetEmailService(email, req);
    res.status(200).json({
      status: 'success',
      data: response,
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});


const resetPassword = expressAsyncHandler(async (req, res) => {
  const resetToken = req.params.token;
  const { password } = req.body;

  try {
    const response = await userService.resetPasswordService(resetToken, password);
    res.status(200).json({
      status: 'success',
      data: response,
      message: 'Password reset successfully',
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});


const getWalletTransactions = expressAsyncHandler(async (req, res) => {
  try {
    const { user } = req;
    const { data, message } = await walletService.getWalletTransactions(user._id);

    res.status(200).json({
      status: 'success',
      data: data,
      message: message,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});


const addCashToWallet = expressAsyncHandler(async (req, res) => {
  const { amount } = req.body;

  try {
    const newTransaction = await walletService.addCashToWallet(req.user._id, Number(amount));

    res.status(201).json({
      status: 'success',
      data: newTransaction,
      message: 'Amount added to wallet successfully',
    });
  } catch (error) {
    res.status(error.message === 'Invalid amount' ? 400 : 500).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});



const getWalletBalance = expressAsyncHandler(async (req, res) => {
  try {
    const balance = await walletService.getWalletBalance(req.user._id);

    res.status(200).json({
      status: 'success',
      data: { balance },
      message: 'Wallet balance retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});

const addReview = expressAsyncHandler(async (req, res) => {
  const { rating, review, bookingId } = req.body;

  try {
    const newReview = await reviewService.addReview(rating, review, bookingId);

    res.status(201).json({
      status: 'success',
      data: newReview,
      message: 'Review added successfully',
    });
  } catch (error) {
    res.status(error.message === 'Booking not found' ? 404 : 500).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});


const getReviews = expressAsyncHandler(async (req, res) => {
  try {
    const reviews = await reviewService.getReviews(req.params.hotelId);

    res.status(200).json({
      status: 'success',
      data: reviews,
      message: 'Reviews retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});

const getBookingReviews = expressAsyncHandler(async (req, res) => {
  try {
    const reviews = await reviewService.getBookingReviews();

    res.status(200).json({
      status: 'success',
      data: reviews,
      message: 'Booking reviews retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});



const cancelBooking = expressAsyncHandler(async (req, res) => {
  try {
    const { bookingId } = req.params;

    const { refundAmount, refundPercentage } = await bookingService.cancelBooking(bookingId);

    const io = req.app.get('io');
    io.emit('newNotification', {
      userId: req.user._id,
      message: `Your booking has been cancelled and ${refundPercentage}% amount has been refunded to your wallet.`,
      createdAt: new Date(),
      isRead: false,
    });

    res.status(200).json({
      status: 'success',
      data: {
        refundAmount,
        refundPercentage,
      },
      message: `Booking successfully cancelled and ${refundPercentage}% amount refunded to wallet`,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});



const getUnreadNotifications = expressAsyncHandler(async (req, res) => {
  try {
    const notifications = await notificationService.getUnreadNotifications(req.user._id);

    res.status(200).json({
      status: 'success',
      data: notifications,
      message: 'Unread notifications retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error',
    });
  }
});


const markNotificationAsRead = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await notificationService.markNotificationAsRead(id, req.user._id);

    res.status(200).json({
      status: 'success',
      data: null,
      message: 'Notification marked as read',
    });
  } catch (error) {
    res.status(error.message === 'Notification not found' ? 404 : 401).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});



export {
  authUser, 
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
  getWalletTransactions,
  addCashToWallet,
  getWalletBalance,
  addReview,
  getReviews,
  getBookingReviews,
  cancelBooking,
  getUnreadNotifications,
  markNotificationAsRead 
};
