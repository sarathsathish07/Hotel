import asyncHandler from 'express-async-handler';
import bookingService from '../services/bookingService.js';
import Notification from '../models/notificationModel.js';
import Hotel from '../models/hotelModel.js';
import HotelierNotification from '../models/hotelierNotifications.js';
import responseMessages from '../constants/responseMessages.js';

const saveBooking = asyncHandler(async (req, res) => {
  const bookingData = {
    userId: req.user._id,
    ...req.body,
    bookingDate: Date.now(),
    bookingStatus: req.body.paymentStatus === 'completed' ? 'confirmed' : 'pending',
  };

  try {
    const createdBooking = await bookingService.createBooking(bookingData, req.user._id);

    res.status(201).json({
      status: 'success',
      data: createdBooking,
      message: responseMessages.BOOKING_CREATED_SUCCESSFULLY,
    });
  } catch (error) {
    console.error(error);
    if (error.message === 'Insufficient wallet balance') {
      res.status(400).json({
        status: 'error',
        data: null,
        message: responseMessages.INSUFFICIENT_WALLET_BALANCE,
      });
    } else if (error.message === 'Hotel not found') {
      res.status(400).json({
        status: 'error',
        data: null,
        message: responseMessages.HOTEL_NOT_FOUND,
      });
    } else {
      res.status(500).json({
        status: 'error',
        data: null,
        message: responseMessages.SERVER_ERROR,
      });
    }
  }
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { paymentId, bookingId, paymentStatus } = req.body;

  try {
    const userNotification = new Notification({
      userId: req.user._id,
      message: 'Your booking has been confirmed via Razorpay payment.',
      createdAt: new Date(),
      isRead: false,
    });
    await userNotification.save();

    const io = req.app.get('io');
    io.emit('newNotification', userNotification);

    const updatedBooking = await bookingService.updateBookingStatusService(paymentId, bookingId, paymentStatus);
    if (!updatedBooking) {
      return res.status(404).json({
        status: 'error',
        data: null,
        message: responseMessages.BOOKING_NOT_FOUND,
      });
    }

    const hotel = await Hotel.findById(updatedBooking.hotelId).populate('hotelierId');
    if (!hotel) {
      return res.status(404).json({
        status: 'error',
        data: null,
        message: responseMessages.HOTEL_NOT_FOUND,
      });
    }

    const hotelierNotification = new HotelierNotification({
      hotelierId: hotel.hotelierId._id,
      message: `You have a new booking for your hotel "${hotel.name}".`,
      createdAt: new Date(),
      isRead: false,
    });
    await hotelierNotification.save();

    io.emit('newNotification', hotelierNotification);

    res.status(200).json({
      status: 'success',
      data: updatedBooking,
      message: responseMessages.BOOKING_STATUS_UPDATED_SUCCESSFULLY,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.SERVER_ERROR,
    });
  }
});

const getBookingsByUserId = asyncHandler(async (req, res) => {
  try {
    const bookings = await bookingService.getBookingsByUserIdService(req.user._id);
    if (bookings && bookings.length > 0) {
      res.status(200).json({
        status: 'success',
        data: bookings,
        message: responseMessages.BOOKINGS_RETRIEVED_SUCCESSFULLY,
      });
    } else {
      res.status(404).json({
        status: 'error',
        data: null,
        message: responseMessages.BOOKINGS_NOT_FOUND,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.SERVER_ERROR,
    });
  }
});

const getHotelierBookings = asyncHandler(async (req, res) => {
  try {
    const bookings = await bookingService.getHotelierBookingsService(req.hotelier._id);
    if (bookings && bookings.length > 0) {
      res.status(200).json({
        status: 'success',
        data: bookings,
        message: responseMessages.BOOKINGS_RETRIEVED_SUCCESSFULLY,
      });
    } else {
      res.status(404).json({
        status: 'error',
        data: null,
        message: responseMessages.BOOKINGS_NOT_FOUND,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.SERVER_ERROR,
    });
  }
});

const getAllBookings = asyncHandler(async (req, res) => {
  try {
    const bookings = await bookingService.getAllBookingsService();
    if (bookings && bookings.length > 0) {
      res.status(200).json({
        status: 'success',
        data: bookings,
        message: responseMessages.BOOKINGS_RETRIEVED_SUCCESSFULLY,
      });
    } else {
      res.status(404).json({
        status: 'error',
        data: null,
        message: responseMessages.BOOKINGS_NOT_FOUND,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.SERVER_ERROR,
    });
  }
});

const checkRoomAvailability = asyncHandler(async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate, roomCount, guestCount } = req.body;

    if (!roomId || !checkInDate || !checkOutDate || !roomCount || !guestCount) {
      return res.status(400).json({
        status: 'error',
        data: null,
        message: responseMessages.MISSING_REQUIRED_FIELDS,
      });
    }

    const availability = await bookingService.checkAvailability(roomId, checkInDate, checkOutDate, roomCount, guestCount);

    res.status(200).json({
      status: 'success',
      data: availability,
      message: responseMessages.ROOM_AVAILABILITY_CHECKED_SUCCESSFULLY,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.SERVER_ERROR,
    });
  }
});

const cancelBooking = asyncHandler(async (req, res) => {
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
      message: responseMessages.BOOKING_CANCELLED_SUCCESSFULLY.replace('{refundPercentage}', refundPercentage),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});

const cancelBookingByHotelier = asyncHandler(async (req, res) => {
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
      message: responseMessages.HOTELIER_BOOKING_CANCELLED_SUCCESSFULLY.replace('{refundPercentage}', refundPercentage),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});

export { saveBooking, updateBookingStatus, getBookingsByUserId, getHotelierBookings, getAllBookings, checkRoomAvailability, cancelBooking, cancelBookingByHotelier };
