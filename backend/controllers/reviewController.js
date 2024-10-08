import expressAsyncHandler from "express-async-handler";
import reviewService from "../services/reviewService.js";
import responseMessages from "../constants/responseMessages.js";

const addReview = expressAsyncHandler(async (req, res) => {
  const { rating, review, bookingId } = req.body;

  try {
    const newReview = await reviewService.addReview(rating, review, bookingId);

    res.status(201).json({
      status: "success",
      data: newReview,
      message: responseMessages.reviewAdded,
    });
  } catch (error) {
    res.status(error.message === "Booking not found" ? 404 : 500).json({
      status: "error",
      data: null,
      message:
        error.message === "Booking not found"
          ? responseMessages.bookingNotFound
          : responseMessages.serverError,
    });
  }
});

const getReviews = expressAsyncHandler(async (req, res) => {
  try {
    const reviews = await reviewService.getReviews(req.params.hotelId);

    res.status(200).json({
      status: "success",
      data: reviews,
      message: responseMessages.reviewsRetrieved,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      data: null,
      message: responseMessages.serverError,
    });
  }
});

const getBookingReviews = expressAsyncHandler(async (req, res) => {
  try {
    const reviews = await reviewService.getBookingReviews();

    res.status(200).json({
      status: "success",
      data: reviews,
      message: responseMessages.bookingReviewsRetrieved,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      data: null,
      message: responseMessages.serverError,
    });
  }
});

export { addReview, getReviews, getBookingReviews };
