import asyncHandler from 'express-async-handler';
import bookingService from '../services/bookingService.js';
import Wallet from '../models/walletModel.js';
import Notification from '../models/notificationModel.js';
import Hotel from '../models/hotelModel.js';
import HotelierNotification from '../models/hotelierNotifications.js';

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
      message: 'Booking created successfully',
    });
  } catch (error) {
    console.error(error);
    if (error.message === 'Insufficient wallet balance' || error.message === 'Hotel not found') {
      res.status(400).json({
        status: 'error',
        data: null,
        message: error.message,
      });
    } else {
      res.status(500).json({
        status: 'error',
        data: null,
        message: 'Server error',
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
        message: 'Booking not found',
      });
    }

    const hotel = await Hotel.findById(updatedBooking.hotelId).populate('hotelierId');
    if (!hotel) {
      return res.status(404).json({
        status: 'error',
        data: null,
        message: 'Hotel not found',
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
      message: 'Booking status updated successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error',
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
        message: 'Bookings retrieved successfully',
      });
    } else {
      res.status(404).json({
        status: 'error',
        data: null,
        message: 'Bookings not found',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error',
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
        message: 'Bookings retrieved successfully',
      });
    } else {
      res.status(404).json({
        status: 'error',
        data: null,
        message: 'Bookings not found',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error',
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
        message: 'All bookings retrieved successfully',
      });
    } else {
      res.status(404).json({
        status: 'error',
        data: null,
        message: 'No bookings found',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error',
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
        message: 'Missing required fields',
      });
    }

    const availability = await bookingService.checkAvailability(roomId, checkInDate, checkOutDate, roomCount, guestCount);

    res.status(200).json({
      status: 'success',
      data: availability,
      message: 'Room availability checked successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error',
    });
  }
});





export { saveBooking ,
  updateBookingStatus,
  getBookingsByUserId,
  getHotelierBookings,
  getAllBookings,
  checkRoomAvailability
};
