import Room from "../models/roomModel.js";

const createRoom = async (hotelId, hotelierId, roomData) => {
  try {
    const room = new Room({
      ...roomData,
      hotelId,
      hotelierId,
    });
    return await room.save();
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

const getRoomById = async (roomId) => {
  try {
    return await Room.findById(roomId).populate("hotelId", "name").exec();
  } catch (error) {
    throw new Error(`Error fetching room details: ${error.message}`);
  }
};

const findRoomsByHotelIds = async (hotelIds) => {
  try {
    return await Room.find({ hotelId: { $in: hotelIds } }).exec();
  } catch (error) {
    throw new Error(`Error fetching rooms: ${error.message}`);
  }
};

export default {
  createRoom,
  getRoomById,
  findRoomsByHotelIds,
};
