import asyncHandler from "express-async-handler";
import adminRepository from "../repositories/adminRepository.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import responseMessages from "../constants/responseMessages.js";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "sarathsathish77@gmail.com",
    pass: "pehs ltsj iktw pqtp",
  },
});

const generateAdminToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET_ADMIN, {
    expiresIn: "30d",
  });

  res.cookie("jwtAdmin", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

const authenticateAdmin = asyncHandler(async (email, password) => {
  const admin = await adminRepository.findAdminByEmailAndPassword(
    email,
    password
  );
  return {
    status: "success",
    data: admin,
    message: responseMessages.ADMIN_AUTH_SUCCESS,
  };
});

const logoutAdmin = asyncHandler(async (res) => {
  res.cookie("jwtAdmin", "", {
    httpOnly: true,
    expires: new Date(),
  });
  return {
    status: "success",
    data: null,
    message: responseMessages.ADMIN_LOGOUT_SUCCESS,
  };
});

const getAllUsers = asyncHandler(async () => {
  const users = await adminRepository.getAllUsers();
  return {
    status: "success",
    data: users,
    message: responseMessages.USERS_RETRIEVED_SUCCESS,
  };
});

const blockUser = asyncHandler(async (userId) => {
  const user = await adminRepository.updateUser(userId, { isBlocked: true });
  return {
    status: "success",
    data: user,
    message: responseMessages.USER_BLOCK_SUCCESS,
  };
});

const unblockUser = asyncHandler(async (userId) => {
  const user = await adminRepository.updateUser(userId, { isBlocked: false });
  return {
    status: "success",
    data: user,
    message: responseMessages.USER_UNBLOCK_SUCCESS,
  };
});

const getAllHotels = asyncHandler(async () => {
  const hotels = await adminRepository.getAllHotels();
  return {
    status: "success",
    data: hotels,
    message: responseMessages.HOTELS_RETRIEVED_SUCCESS,
  };
});

const listHotel = asyncHandler(async (hotelId) => {
  const hotel = await adminRepository.listHotel(hotelId);
  return {
    status: "success",
    data: hotel,
    message: responseMessages.HOTEL_LIST_SUCCESS,
  };
});

const unlistHotel = asyncHandler(async (hotelId) => {
  const hotel = await adminRepository.unlistHotel(hotelId);
  return {
    status: "success",
    data: hotel,
    message: responseMessages.HOTEL_UNLIST_SUCCESS,
  };
});

const getVerificationDetails = asyncHandler(async () => {
  const details = await adminRepository.getPendingHotelierVerifications();
  return {
    status: "success",
    data: details,
    message: responseMessages.VERIFICATION_DETAILS_RETRIEVED_SUCCESS,
  };
});

const acceptVerification = asyncHandler(async (hotelId) => {
  const hotel = await adminRepository.findHotelById(hotelId);
  if (!hotel) {
    return {
      status: "error",
      data: null,
      message: responseMessages.HOTEL_NOT_FOUND,
    };
  }

  hotel.verificationStatus = "accepted";
  await adminRepository.saveHotel(hotel);

  const hotelier = await adminRepository.findHotelierById(hotel.hotelierId);
  if (!hotelier) {
    return {
      status: "error",
      data: null,
      message: responseMessages.HOTELIER_NOT_FOUND,
    };
  }

  await sendVerificationEmail(
    hotelier.email,
    responseMessages.VERIFICATION_ACCEPTED_SUBJECT,
    responseMessages.VERIFICATION_ACCEPTED_SUCCESS
  );

  return {
    status: "success",
    data: hotel,
    message: responseMessages.VERIFICATION_ACCEPTED_SUCCESS,
  };
});

const rejectVerification = asyncHandler(async (hotelId, reason) => {
  const hotel = await adminRepository.findHotelById(hotelId);
  if (!hotel) {
    return {
      status: "error",
      data: null,
      message: responseMessages.HOTEL_NOT_FOUND,
    };
  }

  hotel.verificationStatus = "rejected";
  await adminRepository.saveHotel(hotel);

  const hotelier = await adminRepository.findHotelierById(hotel.hotelierId);
  if (!hotelier) {
    return {
      status: "error",
      data: null,
      message: responseMessages.HOTELIER_NOT_FOUND,
    };
  }

  const message = `Your verification request has been rejected for the following reason: ${reason}`;
  await sendVerificationEmail(
    hotelier.email,
    responseMessages.VERIFICATION_REJECTED_SUBJECT,
    message
  );

  return {
    status: "success",
    data: hotel,
    message: responseMessages.VERIFICATION_REJECTED_SUCCESS,
  };
});

const sendVerificationEmail = async (recipient, subject, message) => {
  try {
    await transporter.sendMail({
      from: "sarathsathish77@gmail.com",
      to: recipient,
      subject: subject,
      text: message,
    });
  } catch (error) {
    console.error(responseMessages.EMAIL_SEND_ERROR, error);
    throw new Error(responseMessages.EMAIL_SEND_ERROR);
  }
};

const getAdminStats = async () => {
  const totalUsers = await adminRepository.countTotalUsers();
  const totalHoteliers = await adminRepository.countTotalHoteliers();
  const totalHotels = await adminRepository.countTotalHotels();
  const totalRevenue = await adminRepository.calculateTotalRevenue();
  const monthlyBookings = await adminRepository.getMonthlyBookings();
  const yearlyBookings = await adminRepository.getYearlyBookings();

  return {
    totalUsers,
    totalHoteliers,
    totalHotels,
    totalRevenue: totalRevenue[0]?.totalRevenue || 0,
    monthlyBookings: monthlyBookings.map(({ _id, count }) => ({
      month: `${_id.year}-${_id.month.toString().padStart(2, "0")}`,
      count,
    })),
    yearlyBookings: yearlyBookings.map(({ _id, count }) => ({
      year: _id.year,
      count,
    })),
  };
};

const getSalesReport = async (from, to) => {
  if (!from || !to) {
    throw new Error(responseMessages.DATE_RANGE_REQUIRED);
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    throw new Error(responseMessages.INVALID_DATE_FORMAT);
  }

  const bookings = await adminRepository.getSalesData(fromDate, toDate);

  return bookings;
};

export default {
  authenticateAdmin,
  logoutAdmin,
  sendVerificationEmail,
  blockUser,
  unblockUser,
  getAllHotels,
  listHotel,
  unlistHotel,
  getAllUsers,
  getVerificationDetails,
  generateAdminToken,
  acceptVerification,
  rejectVerification,
  getAdminStats,
  getSalesReport,
};
