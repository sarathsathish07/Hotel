import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Hotelier from '../models/hotelierModel.js';
import Hotel from '../models/hotelModel.js';
import Booking from '../models/bookingModel.js';

const credentials = {
  email: 'admin@gmail.com',
  password: '12345',
  _id: '61024896',
};

const findAdminByEmailAndPassword = asyncHandler(async (email, password) => {
  if (email === credentials.email && password === credentials.password) {
    return credentials;
  } else {
    throw new Error('Invalid Credentials');
  }
});

const getAllUsers = asyncHandler(async () => {
  return await User.find({}, { name: 1, email: 1, profileImageName: 1, isBlocked: 1 });
});

const updateUser = asyncHandler(async (userId, userData) => {
  const user = await User.findById(userId);
  if (user) {
    user.name = userData.name || user.name;
    user.email = userData.email || user.email;
    user.isBlocked = userData.isBlocked !== undefined ? userData.isBlocked : user.isBlocked;
    return await user.save();
  } else {
    throw new Error('User not found');
  }
});


const deleteUserById = asyncHandler(async (userId) => {
  return await User.findByIdAndDelete(userId);
});

const createUser = asyncHandler(async (name, email, password) => {
  const userExist = await User.findOne({ email });
  if (userExist) {
    throw new Error('User already exists');
  } else {
    const user = await User.create({
      name,
      email,
      password,
    });
    return user;
  }
});

const getPendingHotelierVerifications = asyncHandler(async () => {
  return await Hotel.find({ verificationStatus: 'pending' }).select('-password');
});

const getAllHotels = asyncHandler(async () => {
  return await Hotel.find({});
});
const listHotel = asyncHandler(async (hotelId) => {
  const hotel = await Hotel.findById(hotelId);

  if (hotel) {
    hotel.isListed = true;
    await hotel.save();
    return { message: 'Hotel listed successfully' };
  } else {
    throw new Error('Hotel not found');
  }
});

const unlistHotel = asyncHandler(async (hotelId) => {
  const hotel = await Hotel.findById(hotelId);

  if (hotel) {
    hotel.isListed = false;
    await hotel.save();
    return { message: 'Hotel unlisted successfully' };
  } else {
    throw new Error('Hotel not found');
  }
});
const findHotelierById = async (id) => {
  return await Hotelier.findById(id);
};
const findHotelById = async (id) => {
  return await Hotel.findById(id);
};

const saveHotelier = async (hotelier) => {
  return await hotelier.save();
};
const saveHotel = async (hotel) => {
  return await hotel.save();
};
const countTotalUsers = async () => {
  return await User.countDocuments();
};

const countTotalHoteliers = async () => {
  return await Hotelier.countDocuments();
};

const countTotalHotels = async () => {
  return await Hotel.countDocuments();
};

const calculateTotalRevenue = async () => {
  return await Booking.aggregate([
    { $match: { bookingStatus: 'confirmed' } },
    { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
  ]);
};

const getMonthlyBookings = async () => {
  return await Booking.aggregate([
    { $match: { bookingStatus: 'confirmed' } },
    {
      $group: {
        _id: {
          month: { $month: "$bookingDate" },
          year: { $year: "$bookingDate" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);
};

const getYearlyBookings = async () => {
  return await Booking.aggregate([
    { $match: { bookingStatus: 'confirmed' } },
    {
      $group: {
        _id: { year: { $year: "$bookingDate" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1 } }
  ]);
};
const getSalesData = async (fromDate, toDate) => {
  return await Booking.aggregate([
    {
      $match: {
        bookingDate: { $gte: fromDate, $lte: toDate },
        bookingStatus: 'confirmed',
      },
    },
    {
      $lookup: {
        from: 'hotels',
        localField: 'hotelId',
        foreignField: '_id',
        as: 'hotel',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $lookup: {
        from: 'rooms',
        localField: 'roomId',
        foreignField: '_id',
        as: 'room',
      },
    },
    {
      $unwind: { path: '$hotel', preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: { path: '$user', preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: { path: '$room', preserveNullAndEmptyArrays: true },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$bookingDate' } },
        totalSales: { $sum: '$totalAmount' },
        userName: { $first: '$user.name' },
        hotelName: { $first: '$hotel.name' },
        roomName: { $first: '$room.type' },
        checkInDate: { $first: '$checkInDate' },
        checkOutDate: { $first: '$checkOutDate' },
        paymentMethod: { $first: '$paymentMethod' },
        paymentStatus: { $first: '$paymentStatus' },
        bookingStatus: { $first: '$bookingStatus' },
        hotelierId: { $first: '$hotelierId' },
        roomsBooked: { $first: '$roomsBooked' },
        paymentId: { $first: '$paymentId' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
};

export default{
  findAdminByEmailAndPassword,
  getAllUsers,
  updateUser,
  deleteUserById,
  createUser,
  getPendingHotelierVerifications,
  getAllHotels,
  listHotel,
  unlistHotel,
  findHotelierById,
  saveHotelier,
  findHotelById,
  saveHotel,
  countTotalUsers,
  countTotalHoteliers,
  countTotalHotels,
  calculateTotalRevenue,
  getMonthlyBookings,
  getYearlyBookings,
  getSalesData
};
