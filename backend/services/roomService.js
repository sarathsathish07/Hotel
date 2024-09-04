import RoomRepository from "../repositories/roomRepository.js";
import responseMessages from "../constants/responseMessages.js";

const addRoomHandler = async (hotelId, hotelierId, roomData) => {
  try {
    const room = await RoomRepository.createRoom(hotelId, hotelierId, roomData);
    return {
      status: "success",
      data: room,
      message: responseMessages.ROOM_ADDED_SUCCESS,
    };
  } catch (error) {
    return { status: "error", data: null, message: error.message };
  }
};

const getRoomByIdHandler = async (roomId) => {
  try {
    const room = await RoomRepository.getRoomById(roomId);
    if (!room) {
      return { status: "error", data: null, message: responseMessages.ROOM_NOT_FOUND };
    }
    return {
      status: "success",
      data: room,
      message: responseMessages.ROOM_RETRIEVED_SUCCESS,
    };
  } catch (error) {
    return { status: "error", data: null, message: error.message };
  }
};

const getRoomsByHotelIdsService = async (hotelIds) => {
  try {
    const rooms = await RoomRepository.findRoomsByHotelIds(hotelIds);
    return {
      status: "success",
      data: rooms,
      message: responseMessages.ROOMS_RETRIEVED_SUCCESS,
    };
  } catch (error) {
    return { status: "error", data: null, message: responseMessages.ERROR_FETCHING_ROOMS };
  }
};

const updateRoomData = async (roomId, updateData, files) => {
  try {
    const room = await RoomRepository.getRoomById(roomId);
    if (!room) {
      return { status: "error", data: null, message: responseMessages.ROOM_NOT_FOUND };
    }

    room.type = updateData.type || room.type;
    room.price = updateData.price || room.price;
    room.area = updateData.area || room.area;
    room.occupancy = updateData.occupancy || room.occupancy;
    room.noOfRooms = updateData.noOfRooms || room.noOfRooms;
    room.description = updateData.description || room.description;
    room.amenities = updateData.amenities
      ? updateData.amenities.split(",").map((item) => item.trim())
      : room.amenities;

    if (files && files.length > 0) {
      const newImages = files.map((file) =>
        file.path.replace(/.*public[\\/]/, "")
      );
      room.images.push(...newImages);
    }

    if (updateData.removeImages && updateData.removeImages.length > 0) {
      room.images = room.images.filter(
        (image) => !updateData.removeImages.includes(image)
      );
    }

    await room.save();
    return {
      status: "success",
      data: room,
      message: responseMessages.ROOM_UPDATE_SUCCESS,
    };
  } catch (error) {
    return { status: "error", data: null, message: error.message };
  }
};

export default {
  getRoomByIdHandler,
  getRoomsByHotelIdsService,
  updateRoomData,
  addRoomHandler,
};
