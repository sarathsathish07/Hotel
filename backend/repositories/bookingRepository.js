import Booking from "../models/bookingModel.js";

const saveNewBooking = async (bookingData) => {
  const booking = new Booking(bookingData);
  return await booking.save();
};

const findBookingById = async (bookingId) => {
  return await Booking.findById(bookingId);
};

const saveUpdatedBooking = async (booking) => {
  return await booking.save();
};

const findBookingsByUserId = async (userId) => {
  return await Booking.find({ userId })
    .populate("hotelId", "name")
    .populate("roomId", "type amenities description");
};

const findBookingsByHotelierId = async (hotelierId) => {
  return await Booking.find({ hotelierId })
    .populate("hotelId")
    .populate("roomId")
    .populate("userId");
};

const findAllBookings = async () => {
  return await Booking.find({})
    .populate("hotelId")
    .populate("roomId")
    .populate("userId")
    .populate("hotelierId");
};

const saveBooking = async (booking) => {
  return await booking.save();
};

export {
  saveNewBooking,
  findBookingById,
  saveUpdatedBooking,
  findBookingsByUserId,
  findBookingsByHotelierId,
  findAllBookings,
  saveBooking,
};
