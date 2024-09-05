import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  checkInDate: {
    type: Date,
    required: true,
  },
  checkOutDate: {
    type: Date,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['wallet', 'razorpay'],
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  bookingStatus: {
    type: String,
    required: true,
    enum: ['confirmed', 'cancelled', 'pending'],
  },
  hotelierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotelier',
    required: true,
  },
  roomsBooked: {
    type: Number,
    required: true,
  },
  guestCount: {
    type: Number,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentId: { 
    type: String,
  },
  cancelMessage : { 
    type: String,
  },
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
