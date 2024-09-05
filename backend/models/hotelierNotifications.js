import mongoose from "mongoose";

const hotelierNotificationSchema = new mongoose.Schema({
  hotelierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotelier",
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const HotelierNotification = mongoose.model(
  "HotelierNotification",
  hotelierNotificationSchema
);

export default HotelierNotification;
