import asyncHandler from 'express-async-handler';
import adminRepository from '../repositories/adminRepository.js';
import nodemailer from 'nodemailer';
import jwt from "jsonwebtoken";

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'sarathsathish77@gmail.com',
    pass: 'pehs ltsj iktw pqtp',
  },
});

const generateAdminToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET_ADMIN, {
    expiresIn: "30d",
  });

  res.cookie('jwtAdmin', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/'
  });
};

const authenticateAdmin = asyncHandler(async (email, password) => {
  const admin = await adminRepository.findAdminByEmailAndPassword(email, password);
  return {
    status: 'success',
    data: admin,
    message: 'Admin authenticated successfully',
  };
});

const logoutAdmin = asyncHandler(async (res) => {
  res.cookie('jwtAdmin', '', {
    httpOnly: true,
    expires: new Date(),
  });
  return {
    status: 'success',
    data: null,
    message: 'Admin logged out successfully',
  };
});

const getAllUsers = asyncHandler(async () => {
  const users = await adminRepository.getAllUsers();
  return {
    status: 'success',
    data: users,
    message: 'Users retrieved successfully',
  };
});

const blockUser = asyncHandler(async (userId) => {
  const user = await adminRepository.updateUser(userId, { isBlocked: true });
  return {
    status: 'success',
    data: user,
    message: 'User blocked successfully',
  };
});

const unblockUser = asyncHandler(async (userId) => {
  const user = await adminRepository.updateUser(userId, { isBlocked: false });
  return {
    status: 'success',
    data: user,
    message: 'User unblocked successfully',
  };
});

const getAllHotels = asyncHandler(async () => {
  const hotels = await adminRepository.getAllHotels();
  return {
    status: 'success',
    data: hotels,
    message: 'Hotels retrieved successfully',
  };
});

const listHotel = asyncHandler(async (hotelId) => {
  const hotel = await adminRepository.listHotel(hotelId);
  return {
    status: 'success',
    data: hotel,
    message: 'Hotel listed successfully',
  };
});

const unlistHotel = asyncHandler(async (hotelId) => {
  const hotel = await adminRepository.unlistHotel(hotelId);
  return {
    status: 'success',
    data: hotel,
    message: 'Hotel unlisted successfully',
  };
});

const getVerificationDetails = asyncHandler(async () => {
  const details = await adminRepository.getPendingHotelierVerifications();
  return {
    status: 'success',
    data: details,
    message: 'Verification details retrieved successfully',
  };
});

const acceptVerification = asyncHandler(async (hotelId) => {
  const hotel = await adminRepository.findHotelById(hotelId);
  if (!hotel) {
    return {
      status: 'error',
      data: null,
      message: 'Hotel not found',
    };
  }
  
  hotel.verificationStatus = 'accepted';
  await adminRepository.saveHotel(hotel);
  
  const hotelier = await adminRepository.findHotelierById(hotel.hotelierId);
  if (!hotelier) {
    return {
      status: 'error',
      data: null,
      message: 'Hotelier not found',
    };
  }
  
  await sendVerificationEmail(hotelier.email, 'Verification Accepted', 'Your verification request has been accepted.');
  
  return {
    status: 'success',
    data: hotel,
    message: 'Verification accepted successfully',
  };
});

const rejectVerification = asyncHandler(async (hotelId, reason) => {
  const hotel = await adminRepository.findHotelById(hotelId);
  if (!hotel) {
    return {
      status: 'error',
      data: null,
      message: 'Hotel not found',
    };
  }
  
  hotel.verificationStatus = 'rejected';
  await adminRepository.saveHotel(hotel);
  
  const hotelier = await adminRepository.findHotelierById(hotel.hotelierId);
  if (!hotelier) {
    return {
      status: 'error',
      data: null,
      message: 'Hotelier not found',
    };
  }
  
  const message = `Your verification request has been rejected for the following reason: ${reason}`;
  await sendVerificationEmail(hotelier.email, 'Verification Rejected', message);
  
  return {
    status: 'success',
    data: hotel,
    message: 'Verification rejected successfully',
  };
});

const sendVerificationEmail = async (recipient, subject, message) => {
  try {
    await transporter.sendMail({
      from: 'sarathsathish77@gmail.com',
      to: recipient,
      subject: subject,
      text: message,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email');
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
      month: `${_id.year}-${_id.month.toString().padStart(2, '0')}`,
      count
    })),
    yearlyBookings: yearlyBookings.map(({ _id, count }) => ({ year: _id.year, count })),
  };
};
const getSalesReport = async (from, to) => {
  if (!from || !to) {
    throw new Error('Date range is required');
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    throw new Error('Invalid date format');
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
  getSalesReport
};
