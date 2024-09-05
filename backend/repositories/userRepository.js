import User from "../models/userModel.js";
import Hotel from "../models/hotelModel.js";
import Room from "../models/roomModel.js";

const findUserByEmail = async (email) => {
  try {
    return await User.findOne({ email }).exec();
  } catch (error) {
    throw new Error(`Error finding user by email: ${error.message}`);
  }
};

const createUser = async (userData) => {
  try {
    return await User.create(userData);
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
};

const findUserById = async (id) => {
  try {
    return await User.findById(id).exec();
  } catch (error) {
    throw new Error(`Error finding user by ID: ${error.message}`);
  }
};

const saveUser = async (user) => {
  try {
    return await user.save();
  } catch (error) {
    throw new Error(`Error saving user: ${error.message}`);
  }
};

const findHotelById = async (id) => {
  try {
    return await Hotel.findById(id).exec();
  } catch (error) {
    throw new Error(`Error finding hotel by ID: ${error.message}`);
  }
};

const findRoomsByHotelId = async (hotelId) => {
  try {
    return await Room.find({ hotelId }).exec();
  } catch (error) {
    throw new Error(`Error finding rooms by hotel ID: ${error.message}`);
  }
};

const findUserByResetToken = async (resetToken) => {
  try {
    return await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).exec();
  } catch (error) {
    throw new Error(`Error finding user by reset token: ${error.message}`);
  }
};

export {
  findUserByEmail,
  createUser,
  findUserById,
  saveUser,
  findHotelById,
  findRoomsByHotelId,
  findUserByResetToken,
};
