import Hotel from '../models/hotelModel.js';
import Hotelier from "../models/hotelierModel.js";
import ChatRoom from '../models/chatRoomModel.js';
import Room from '../models/roomModel.js';
import Booking from '../models/bookingModel.js';

const getAcceptedHotels = async (sortCriteria, filterCriteria) => {
  const pipeline = [
    {
      $lookup: {
        from: 'hoteliers',
        localField: 'hotelierId',
        foreignField: '_id',
        as: 'hotelier',
      },
    },
    {
      $unwind: '$hotelier',
    },
    {
      $match: filterCriteria,
    },
    {
      $lookup: {
        from: 'rooms',
        localField: '_id',
        foreignField: 'hotelId',
        as: 'rooms',
      },
    },
    {
      $addFields: {
        averagePrice: { $avg: "$rooms.price" },
      },
    },
    {
      $project: {
        name: 1,
        city: 1,
        address: 1,
        images: 1,
        description: 1,
        amenities: 1,
        isListed: 1,
        hotelierId: 1,
        averagePrice: 1,
      },
    },
  ];

  if (Object.keys(sortCriteria).length > 0) {
    pipeline.push({
      $sort: sortCriteria,
    });
  }

  return await Hotel.aggregate(pipeline);
};


const findHotelierByEmail = async (email) => {
  return await Hotelier.findOne({ email });
};

const createHotelier = async (hotelierData) => {
  return await Hotelier.create(hotelierData);
};

const createHotel = async (hotelierId, hotelData) => {
  const hotel = new Hotel({ ...hotelData, hotelierId });
  return await hotel.save();
};

const findHotelsByHotelierId = async (hotelierId) => {
  return await Hotel.find({ hotelierId });
};

const findHotelById = async (hotelId) => {
  return await Hotel.findById(hotelId);
};
const findRoomById = async (hotelId) => {
  return await Room.find({ hotelId });
};

const findHotelierById = async (id) => {
  return await Hotelier.findById(id);
};

const saveHotelier = async (user) => {
  return await user.save();
};
const countUnreadMessagesForHotels = async (hotelIds) => {
  const chatRooms = await ChatRoom.find({ hotelId: { $in: hotelIds } });
  const chatRoomIds = chatRooms.map(chatRoom => chatRoom._id);

  const unreadMessagesCount = await Message.countDocuments({
    chatRoomId: { $in: chatRoomIds },
    senderType: 'User',
    read: false,
  });

  return unreadMessagesCount;
};
const findRoomsByHotelId = async (hotelId) => {
  return Room.find({ hotelId });
};
const findChatRoomsByHotelId = async (hotelId) => {
  return ChatRoom.find({ hotelId });
};
const countUnreadMessagesForChatRooms = async (chatRoomIds) => {
  return Message.countDocuments({
    chatRoomId: { $in: chatRoomIds },
    senderType: 'User',
    read: false,
  });
};

const countTotalHotels = async (hotelierId) => {
  return Hotel.countDocuments({ hotelierId });
};

const countTotalBookings = async (hotelierId) => {
  return Booking.countDocuments({ hotelierId, bookingStatus: 'confirmed' });
};

const calculateTotalRevenue = async (hotelierId) => {
  return Booking.aggregate([
    { $match: { hotelierId, bookingStatus: 'confirmed' } },
    { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } },
  ]);
};

const getMonthlyBookings = async (hotelierId) => {
  return Booking.aggregate([
    { $match: { hotelierId, bookingStatus: 'confirmed' } },
    {
      $group: {
        _id: {
          month: { $month: "$bookingDate" },
          year: { $year: "$bookingDate" }
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);
};

const getYearlyBookings = async (hotelierId) => {
  return Booking.aggregate([
    { $match: { hotelierId, bookingStatus: 'confirmed' } },
    {
      $group: {
        _id: { year: { $year: "$bookingDate" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1 } }
  ]);
};
const getSalesReport = async (hotelierId, fromDate, toDate) => {
  return Booking.aggregate([
    {
      $match: {
        bookingDate: { $gte: fromDate, $lte: toDate },
        bookingStatus: 'confirmed',
        hotelierId: hotelierId
      }
    },
    {
      $lookup: {
        from: 'hotels',
        localField: 'hotelId',
        foreignField: '_id',
        as: 'hotelDetails'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $lookup: {
        from: 'rooms',
        localField: 'roomId',
        foreignField: '_id',
        as: 'roomDetails'
      }
    },
    {
      $unwind: '$hotelDetails'
    },
    {
      $unwind: '$userDetails'
    },
    {
      $unwind: '$roomDetails'
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" } },
        totalSales: { $sum: '$totalAmount' },
        userName: { $first: '$userDetails.name' },
        hotelName: { $first: '$hotelDetails.name' },
        roomName: { $first: '$roomDetails.type' },
        checkInDate: { $first: '$checkInDate' },
        checkOutDate: { $first: '$checkOutDate' },
        paymentMethod: { $first: '$paymentMethod' },
        bookingStatus: { $first: '$bookingStatus' }
      }
    }
  ]);
};

export default {
  getAcceptedHotels,
  findHotelierByEmail,
  createHotelier,
  createHotel,
  findHotelsByHotelierId,
  findHotelById,
  findHotelierById,
  saveHotelier,
  findRoomById,
  countUnreadMessagesForHotels,
  findRoomsByHotelId,
  findChatRoomsByHotelId,
  countUnreadMessagesForChatRooms,
  countTotalHotels, countTotalBookings, calculateTotalRevenue, getMonthlyBookings, getYearlyBookings,getSalesReport
};
