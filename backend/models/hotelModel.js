import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amenities: {
      type: [String],
      required: true,
    },
    isListed: {
      type: Boolean,
      default: false,
    },
    hotelierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotelier",
      required: true,
    },
    certificate: {
      type: String,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: null,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;
