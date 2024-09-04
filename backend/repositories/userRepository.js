import User from '../models/userModel.js';
import Hotel from '../models/hotelModel.js';
import Room from '../models/roomModel.js';

const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

const createUser = async (userData) => {
  return await User.create(userData);
};

const findUserById = async (id) => {
  return await User.findById(id);
};  

const saveUser = async (user) => {
  return await user.save();
};
const findHotelById = async (id) => {
  return await Hotel.findById(id).exec();
};

const findRoomsByHotelId = async (hotelId) => {
  return await Room.find({ hotelId }).exec();
};
const findUserByResetToken = async (resetToken) => {
  return await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
};

export {
  findUserByEmail,
  createUser,
  findUserById,
  saveUser,
  findHotelById,
  findRoomsByHotelId,
  findUserByResetToken
};
