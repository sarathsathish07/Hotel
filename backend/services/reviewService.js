
import reviewRepository from '../repositories/reviewRepository.js';

const addReview = async (rating, review, bookingId) => {
  const booking = await reviewRepository.findBookingById(bookingId);

  if (!booking) {
    throw new Error('Booking not found');
  }

  const newReview = {
    userId: booking.userId._id,
    hotelId: booking.hotelId._id,
    rating,
    review,
    bookingId: booking._id,
  };

  return await reviewRepository.createReview(newReview);
};

const getReviews = async (hotelId) => {
  return await reviewRepository.findReviewsByHotelId(hotelId);
};

const getBookingReviews = async () => {
  return await reviewRepository.findAllReviews();
};

export default { addReview,getReviews,getBookingReviews };
