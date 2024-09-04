
import Booking from '../models/bookingModel.js';
import RatingReview from '../models/ratingReviewModel.js';

const findBookingById = async (bookingId) => {
  try {
    return await Booking.findById(bookingId).populate('userId hotelId').exec();
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

const createReview = async (reviewData) => {
  try {
    const newReview = new RatingReview(reviewData);
    return await newReview.save();
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};
const findReviewsByHotelId = async (hotelId) => {
  try {
    return await RatingReview.find({ hotelId }).populate('userId', 'name').exec();
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};
const findAllReviews = async () => {
  try {
    return await RatingReview.find()
      .populate('userId', 'name')
      .populate('hotelId', 'name')
      .exec();
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export default { findBookingById, createReview,findReviewsByHotelId,findAllReviews  };
