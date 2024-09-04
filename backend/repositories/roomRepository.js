import Room from '../models/roomModel.js';

const createRoom = async (hotelId, hotelierId, roomData) => {
  const room = new Room({
    ...roomData,
    hotelId,
    hotelierId,
  });

  return await room.save();
};
const getRoomById = async (roomId) => {
  try {
    const room = await Room.findById(roomId).populate('hotelId','name');
    return room;
  } catch (error) {
    throw new Error('Error fetching room details');
  }
};
const findRoomsByHotelIds = async (hotelIds) => {
  try {
    return await Room.find({ hotelId: { $in: hotelIds } });
  } catch (error) {
    throw new Error('Error fetching rooms');
  }
};

export default { createRoom ,
  getRoomById,
  findRoomsByHotelIds
};
