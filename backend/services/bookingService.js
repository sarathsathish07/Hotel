import {
  findBookingById,
  saveUpdatedBooking,
  findBookingsByUserId,
  findBookingsByHotelierId,
  findAllBookings,
  saveBooking,
} from "../repositories/bookingRepository.js";
import walletRepository from "../repositories/walletRepository.js";
import notificationRepository from "../repositories/notificationRepository.js";
import hotelRepository from "../repositories/hotelRepository.js";
import Room from "../models/roomModel.js";
import Booking from "../models/bookingModel.js";
import Hotel from "../models/hotelModel.js";

const checkAvailability = async (
  roomId,
  checkInDate,
  checkOutDate,
  roomCount,
  guestCount
) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return { status: "error", data: null, message: "Room not found" };
    }

    const roomsRequired = Math.ceil(guestCount / room.occupancy);
    if (roomsRequired > roomCount) {
      return {
        status: "error",
        data: null,
        message: `You need at least ${roomsRequired} rooms for ${guestCount} guests.`,
      };
    }

    const bookings = await Booking.find({
      roomId,
      checkInDate: { $lt: new Date(checkOutDate) },
      checkOutDate: { $gt: new Date(checkInDate) },
    });

    const totalBookedRooms = bookings.reduce(
      (acc, booking) => acc + booking.roomsBooked,
      0
    );

    const isAvailable = totalBookedRooms + roomsRequired <= room.noOfRooms;

    if (!isAvailable) {
      return {
        status: "error",
        data: null,
        message: "Not enough rooms available for the selected dates.",
      };
    }

    return {
      status: "success",
      data: { isAvailable: true },
      message: "Rooms are available.",
    };
  } catch (error) {
    return { status: "error", data: null, message: error.message };
  }
};

const updateBookingStatusService = async (
  paymentId,
  bookingId,
  paymentStatus
) => {
  try {
    const booking = await findBookingById(bookingId);
    if (!booking) {
      return { status: "error", data: null, message: "Booking not found" };
    }
    booking.paymentId = paymentId;
    booking.paymentStatus = paymentStatus;
    booking.bookingStatus = "confirmed";
    const updatedBooking = await saveUpdatedBooking(booking);
    return {
      status: "success",
      data: updatedBooking,
      message: "Booking status updated successfully",
    };
  } catch (error) {
    return { status: "error", data: null, message: error.message };
  }
};

const createBooking = async (bookingData, userId) => {
  if (bookingData.paymentMethod === "wallet") {
    bookingData.paymentStatus = "completed";
    bookingData.bookingStatus = "confirmed";

    const wallet = await walletRepository.findWalletByUserId(userId);
    if (!wallet || wallet.balance < bookingData.totalAmount) {
      throw new Error("Insufficient wallet balance");
    }

    wallet.balance -= bookingData.totalAmount;
    wallet.transactions.push({
      user: userId,
      amount: bookingData.totalAmount,
      transactionType: "debit",
    });
    await walletRepository.saveWallet(wallet);

    const userNotification = {
      userId,
      message: "Your booking has been confirmed via wallet payment.",
      createdAt: new Date(),
      isRead: false,
    };
    await notificationRepository.createNotification(userNotification);

    const hotel = await Hotel.findById(bookingData.hotelId).populate(
      "hotelierId"
    );
    if (!hotel) {
      throw new Error("Hotel not found");
    }

    const hotelierNotification = {
      hotelierId: hotel.hotelierId._id,
      message: `You have a new booking for your hotel "${hotel.name}".`,
      createdAt: new Date(),
      isRead: false,
    };
    await notificationRepository.createHotelierNotification(
      hotelierNotification
    );
  }

  return await bookingRepository.saveNewBooking(bookingData);
};

const getBookingsByUserIdService = async (userId) => {
  try {
    const bookings = await findBookingsByUserId(userId);
    return {
      status: "success",
      data: bookings,
      message: "Bookings retrieved successfully",
    };
  } catch (error) {
    return { status: "error", data: null, message: error.message };
  }
};

const getHotelierBookingsService = async (hotelierId) => {
  try {
    const bookings = await findBookingsByHotelierId(hotelierId);
    return {
      status: "success",
      data: bookings,
      message: "Hotelier bookings retrieved successfully",
    };
  } catch (error) {
    return { status: "error", data: null, message: error.message };
  }
};

const getAllBookingsService = async () => {
  try {
    const bookings = await findAllBookings();
    return {
      status: "success",
      data: bookings,
      message: "All bookings retrieved successfully",
    };
  } catch (error) {
    return { status: "error", data: null, message: error.message };
  }
};

const cancelBooking = async (bookingId) => {
  const booking = await findBookingById(bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  const today = new Date();
  const checkInDate = new Date(booking.checkInDate);
  const diffHours = Math.ceil((checkInDate - today) / (1000 * 60 * 60));

  let refundPercentage = 0;

  if (diffHours > 48) {
    refundPercentage = 100;
  } else if (diffHours >= 24) {
    refundPercentage = 50;
  }

  booking.bookingStatus = "cancelled";
  booking.cancelMessage = `Your booking has been cancelled and ${refundPercentage}% amount has been refunded to your wallet.`;
  await saveBooking(booking);

  const wallet = await walletRepository.findWalletByUserId(booking.userId);
  const refundAmount = (booking.totalAmount * refundPercentage) / 100;

  if (refundAmount > 0) {
    wallet.balance += refundAmount;
    wallet.transactions.push({
      user: booking.userId,
      amount: refundAmount,
      transactionType: "credit",
    });
    await walletRepository.saveWallet(wallet);
  }

  const userNotification = {
    userId: booking.userId,
    message: `Your booking has been cancelled and ${refundPercentage}% amount has been refunded to your wallet.`,
    createdAt: new Date(),
    isRead: false,
  };
  await notificationRepository.createNotification(userNotification);

  const hotel = await hotelRepository.findHotelById(booking.hotelId);

  if (hotel) {
    const hotelierNotification = {
      hotelierId: hotel.hotelierId._id,
      message: `A booking for your hotel "${hotel.name}" has been cancelled.`,
      createdAt: new Date(),
      isRead: false,
    };
    await notificationRepository.createHotelierNotification(
      hotelierNotification
    );
  }

  return {
    refundAmount,
    refundPercentage,
  };
};

export default {
  checkAvailability,
  createBooking,
  updateBookingStatusService,
  getBookingsByUserIdService,
  getHotelierBookingsService,
  getAllBookingsService,
  cancelBooking,
};
